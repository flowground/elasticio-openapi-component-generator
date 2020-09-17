const path = require('path');

const download = require('./download');
const validate = require('./validate');
const generate = require('./generate');

/**
 * CLI utility for generating a single connector
 * @param {string[]} args
 * @param {string} args[2] - url to download the swagger definition from
 * @param {string} args[3] - output directory
 * @param {string} args[4] - connector name
 * @returns {Promise<void>}
 */
async function run(args) {
    const [url, outputDir, connectorName] = args.slice(2);
    if (!(url && outputDir && connectorName)) {
        throw new Error('Missing one or more required parameters: url, output directory and connector name.');
    }

    const downloadPath = path.join(outputDir, 'openapi-original.json');
    const validatePath = path.join(outputDir, 'openapi-validated.json');
    const generatePath = path.join(outputDir, 'generated');

    console.log('Downloading...');
    await download({
        swaggerUrl: url,
        outputFile: downloadPath,
    });

    console.log('Validating...');
    await validate({
        inputFile: downloadPath,
        outputFile: validatePath,
        swaggerUrl: url,
    });

    console.log('Generating...');
    await generate({
        inputFile: validatePath,
        outputDir: generatePath,
        packageName: connectorName,
        swaggerUrl: url,
    });

    console.log('Successfully generated. Output directory:', outputDir);
}

run(process.argv);