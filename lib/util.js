module.exports.getRepoWebUrl = function getRepoWebUrl(org, connName) {
    return 'https://github.com/' + encodeURIComponent(org) + '/' + encodeURIComponent(connName);
};