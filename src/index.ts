import {Project,} from "ts-morph";
import * as fs from "fs";
import {OpenApiSchema} from "./models/openApiSchema";
import {registerTypes} from "./models/registerTypes";
import {processSchemas} from "./schemas/processSchemas";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";
import {processPaths} from "./paths/processPaths";

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
const httpFile = inputClientDir + "/src/http.ts"
const outputFile: string = argv.outputFile;

const typesProject = new Project();
console.log(`Loading files at ${typesPath})`)
typesProject.addSourceFilesAtPaths(typesPath);

const httpProject = new Project();
console.log(`Loading HTTP definitions in ${httpFile}`)
httpProject.addSourceFileAtPath(httpFile);

const openAPISchema: OpenApiSchema = {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "Lemmy REST API",
        description: "Lemmy REST API (v3) OpenAPI 3.0.0 generated specification.",
    },
    paths: {},
    components: {
        schemas: {}
    },
};

const typeRegistry: {
    [name: string]: boolean
} = {};

registerTypes(typesProject.getSourceFiles(), typeRegistry)

const paths = processPaths(httpProject.getSourceFileOrThrow("http.ts"), typeRegistry);

openAPISchema.paths = paths;

processSchemas(typesProject.getSourceFiles(), typeRegistry, openAPISchema)

console.log(JSON.stringify(openAPISchema, null, 2));

fs.writeFileSync(outputFile, JSON.stringify(openAPISchema, null, 2))