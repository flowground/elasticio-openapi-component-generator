const path = require('path');

const fse = require('fs-extra');
const simpleGit = require('simple-git/promise');
const shellescape = require('shell-escape');
let requestPromise = require('./request').promise;
const util = require('./util');

/**
 * Pushes a generated connector to github
 * @param {object} opts - named arguments
 * @param {string} opts.org - github organization
 * @param {string} opts.githubApiToken - github api token
 * @param {string} opts.githubIdentityFile - github private key
 * @param {string} opts.connName - package name
 * @param {string} opts.connDir - source local dir holding connector files
 * @param {string} opts.repoDir - temporary local dir to use for pushing (ALL FILES IN THIS FOLDER ARE INITIALLY REMOVED!!)
 * @param {function} [opts.outputHandler] - simple-git output handler for logging purposes
 * @param {function} [opts.log] - logs phases
 * @returns {Promise} - resolves after successful push; rejects otherwise
 */
module.exports = async function github(opts) {
    let repoName = opts.connName;
    let repoDescription = 'Generated flowground connector - ' + repoName;
    let repoUrl = 'git@github.com:' + encodeURIComponent(opts.org) + '/' + encodeURIComponent(repoName) + '.git';

    let repo = await getRepo(repoName);
    let repoExists = !!repo;
    log(repoExists? '(existing)' : '(new)');

    fse.removeSync(opts.repoDir);
    fse.mkdirpSync(opts.repoDir);

    let git = simpleGit(opts.repoDir);
    await git.env('GIT_SSH_COMMAND', shellescape([
        'ssh',
        '-i', opts.githubIdentityFile,
        '-l', 'git',
        '-o', 'StrictHostKeyChecking=no',
    ]));
    //await git.silent(true);
    //await git.addConfig('core.autocrlf', true);
    await git.outputHandler(opts.outputHandler);

    if(!repoExists) {
        log('create');
        await createRepo({
            name: repoName,
            description: repoDescription,
        });

        await git.init();
        await git.addRemote('origin', repoUrl);
    }
    else {
        log('update');
        await updateRepo(repoName, {
            name: repoName,
            description: repoDescription,
        });

        await git.clone(repoUrl, '.');
    }

    log('copy');
    fse.copySync(opts.connDir, opts.repoDir, {
        preserveTimestamps: true,
        filter: src => path.basename(src) !== '.git',
    });

    await git.add('.');
    await git.addConfig('user.email', 'flowground@telekom.de');
    await git.commit('Automatic code generation ' + new Date().toISOString());
    await git.push('origin', 'master', ['-v']);
    return {
        repoWebUrl: util.getRepoWebUrl(opts.org, opts.connName),
    };

    // generic github request
    function request(method, path, options) {
        return requestPromise.defaults({
            method: method,
            baseUrl: 'https://api.github.com',
            uri: !Array.isArray(path) ? path : path.map(part => '/' + encodeURIComponent(part)).join(''),
            headers: {
                Authorization: 'token ' + opts.githubApiToken,
                'User-Agent': 'flowground connector generator',
            },
            json: true,
        })(options);
    }

    function getRepo(repoName) {
        return request('get', ['repos', opts.org, repoName]).catch(err => {
            if(err.statusCode === 404) {
                return null;
            }
            return Promise.reject(err);
        });
    }

    /**
     * Creates a new organization repo
     * https://developer.github.com/v3/repos/#create
     * @param {object} repo
     */
    async function createRepo(repo) {
        return request('post', ['orgs', opts.org, 'repos'], {body: repo});
    }

    /**
     * Updates an organization repo
     * https://developer.github.com/v3/repos/#edit
     * @param {string} repoName
     * @param {object} props - props to update
     */
    async function updateRepo(repoName, props) {
        return request('patch', ['repos', opts.org, repoName], {body: props});
    }

    function log(msg) {
        opts.log && opts.log(msg);
    }
};