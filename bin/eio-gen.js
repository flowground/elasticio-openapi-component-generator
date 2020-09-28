#!/usr/bin/env node

/**
 * Deutsche Telekom: elasticio-openapi-component-generator
 * Copyright © 2020, Deutsche Telekom AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 */

const _ = require('lodash');
const path = require('path');
const fse = require('fs-extra');
const getopts = require('getopts');
const readline = require('readline');

const download = require('../lib/download');
const validate = require('../lib/validate');
const generate = require('../lib/generate');

module.exports = eioGen;

eioGen().catch(e => {
    console.error('An error occurred.', e.message);
    process.exit(1);
});

/**
 * CLI utility for generating a single connector
 * @returns {Promise<void>}
 */
async function eioGen() {
    const options = getopts(process.argv.slice(2), {
        alias: {
            output: 'o',
            name: 'n',
            help: 'h',
        },
        string: ['o', 'n'],
    });
    if (options.help) {
        printHelp();
        return;
    }

    const url = options._[0];
    if (!url) {
        printHelp();
        throw new Error('Missing required parameter. Please provide an url to download the swagger definition from or a path to a local file.');
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let outputDir = options.output;
    if (!outputDir) {
        outputDir = await askQuestion(rl, 'Output directory', 'output');
    }
    const downloadedSpecFile = path.join(outputDir, 'openapi-original.json');
    const validatedSpecFile = path.join(outputDir, 'openapi-validated.json');
    const generatePath = path.join(outputDir, 'generated');

    console.log('Downloading...');
    await download({
        swaggerUrl: url,
        outputFile: downloadedSpecFile,
    });

    console.log('Validating...');
    await validate({
        inputFile: downloadedSpecFile,
        outputFile: validatedSpecFile,
        swaggerUrl: url,
    });

    let connectorName = options.name;
    if (!connectorName) {
        const defaultConnName = await fse.readJson(validatedSpecFile)
            .then(def => _.kebabCase(def.info.title).replace(/-v-([0-9])+/g, '-v$1') + '-connector');
        connectorName = await askQuestion(rl, 'Connector name', defaultConnName);
    }

    console.log('Generating...');
    await generate({
        inputFile: validatedSpecFile,
        outputDir: generatePath,
        packageName: connectorName,
        swaggerUrl: url,
    });

    console.log('Successfully generated. Connector has been saved in output directory:', generatePath);
    rl.close();
}

/**
 * Prompt user with a question, together with default value
 * Format: "Question text: (defaultValue)"
 *
 * @param {object} rl - readline interface
 * @param {string} question
 * @param {string} defaultValue
 * @returns {Promise<string>} - resolved with user input, if provided, else with default value
 */
function askQuestion(rl, question, defaultValue) {
    rl.setPrompt(question + ': (' + defaultValue + ') ');
    rl.prompt();

    return new Promise(resolve =>
        rl.on('line', userInput => resolve(userInput || defaultValue))
    );
}

function printHelp() {
    console.log(`
        Usage: eio-gen [OPTIONS] {URL|FILE}
        Usage example: eio-gen -o petstore-connector -n petstore https://petstore.swagger.io/v2/swagger.json\n
        Generate a connector from an OpenAPI definition provided from an url or a local file.\n
        Options:
          -o, --output \t\t output directory where to store the downloaded and validated specification files and the generated connector
          -n, --name \t\t connector name used as package name in package.json file
          -h, --help \t\t display this help
    `);
}
