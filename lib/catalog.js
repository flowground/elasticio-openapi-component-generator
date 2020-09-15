const path = require('path');
const _ = require('lodash');
const fse = require('fs-extra');

const request = require('./request').promise;
const util = require('./util');

/**
 * Registers a connector definition into Connector Catalog (CC)
 * @param {object} opts - named args
 * @param {string} opts.registerUrl - CC url used for registration
 * @param {string} opts.ownerId - owner user id
 * @param {string} opts.username - auth username
 * @param {string} opts.password - auth password
 * @param {string} opts.org - GitHub organization
 * @param {string} opts.connName - connector name
 * @param {string} opts.connDir - connector folder containing component.json and logo.png
 */
module.exports = function(opts) {
    return request({
        method: 'post',
        url: opts.registerUrl,
        headers: {
            Authorization: getAuthHeader(opts.username + ':' + opts.password),
            'X-EIO-USER-ID': opts.ownerId,
        },
        json: true,
        body: {
            componentJson: JSON.parse(fse.readFileSync(path.join(opts.connDir, '/component.json'))),
            logo: Buffer.from(fse.readFileSync(path.join(opts.connDir, 'logo.png'))).toString('base64'),
            repoUrl:  util.getRepoWebUrl(opts.org, opts.connName),
        },
    });

};

/**
 * Memoized function that computes the basic auth header based on username+password
 * @param {string} cred - credentials in format <username>:<password>
 * @returns {string} - basic auth header
 */
const getAuthHeader = _.memoize(cred => 'Basic ' + Buffer.from(cred).toString('base64'));