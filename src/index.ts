import {Project,} from "ts-morph";
import * as fs from "fs";
import {OpenApiSchema} from "./openApiSchema";
import {registerTypes} from "./registerTypes";
import {processSchemas} from "./processSchemas";
import yargs, {option} from "yargs";
import {hideBin} from "yargs/helpers";

interface CommandLineOptions {
    clientDir: string,
    outputFile: string,
}

const argv = yargs(hideBin(process.argv))
    .option('client-dir', {
        alias: 'c',
        description: "Specify the base directory for the lemmy JS client. Example: /Users/username/dev/lemmy-js-client",
        type: "string",
        default: ".",
    })
    .option('output-file', {
        alias: 'o',
        description: "A file to write the resultant Open API json schema to",
        type: "string",
        default: "./openapi.json",
    })
    .help()
    .alias('h', 'help')
    .argv as CommandLineOptions

const inputClientDir: String = argv.clientDir
const typesPath = inputClientDir + "/src/types/*.ts"
const outputFile: string = argv.outputFile;

const project = new Project();
console.log(`Loading files at ${typesPath})`)
project.addSourceFilesAtPaths(typesPath);

const openAPISchema: OpenApiSchema = {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "Lemmy REST API",
    },
    paths: {},
    components: {
        schemas: {},
    },
};

const typeRegistry: {
    [name: string]: boolean
} = {};

registerTypes(project.getSourceFiles(), typeRegistry)

processSchemas(project.getSourceFiles(), typeRegistry, openAPISchema)

console.log(JSON.stringify(openAPISchema, null, 2));

fs.writeFileSync(outputFile, JSON.stringify(openAPISchema, null, 2))