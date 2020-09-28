# elasticio-openapi-component-generator

Generate elastic.io connectors out of Swagger/OpenAPI specifications.

## Description

This service receives a Swagger/OpenAPI API specification and generates a connector out of it.\
The required input is an URL or a local file. Both versions are supported, Swagger v2 and
OpenAPI v3.\
Internally, every Swagger file is converted to OpenAPI v3.\
The generator stores all files in a specific output directory (provided as an option or chosen during execution).

## Usage

### NodeJS script
```shell
node eio-gen.js -o <Output directory> -n <Connector name> <Swagger/OpenAPI file location|Swagger/OpenApi URL> 
```
### CLI command
```shell
eio-gen --help
eio-gen -o <Output directory> -n <Connector name> <Swagger/OpenAPI file location|Swagger/OpenApi URL> 
```
### Command line arguments and options
- `url|file` - URL of Swagger/OpenAPI specification or path to file where specification is stored
(options)
- `-o` or `--output` - output directory where to store the connector files (default: `output`)
- `-n` or `--name` - connector name used as a package name in package.json (default: extracted from title provided in Swagger/OpenAPI definition)\
Unless `-y`, `--yes` option is provided, if output or name options are missing, user will be prompt with questions having default values.
- `-y` or `--yes` - skip questionnaire and populate all options with default values
- `-h` or `--help` - show help

#### Install npm package

##### Install package and require module to use it as a library
```shell
npm install -g elasticio-openapi-component-generation
```

```
require('elasticio-openapi-component-generation').eioGen();

const {download, validate, generate} = require('elasticio-openapi-component-generation');
```

##### Install globally to use it as a CLI
```shell
npm install -g elasticio-openapi-component-generation
eio-gen -h
```