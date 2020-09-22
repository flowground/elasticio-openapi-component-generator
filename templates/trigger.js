/**
 * Deutsche Telekom: <%= packageName %>
 * Copyright © 2020, Deutsche Telekom AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const processWrapper = require('../services/process-wrapper');

module.exports.process = processWrapper(processTrigger);

function processTrigger(msg, cfg, snapshot) {
    this.emitData({
        now: new Date().toISOString(),
        config: cfg,
        snapshot: snapshot,
    });
}