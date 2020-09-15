let defaults = {
    proxy: process.env.MASS_PROXY,
    timeout: 5000,
};

/**
 * Custom request() functions with optional proxy
 * https://www.npmjs.com/package/request
 * https://www.npmjs.com/package/request-promise
 */

let request = require('request').defaults(defaults);
request.promise = require('request-promise').defaults(defaults);

module.exports = request;