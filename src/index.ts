import {Project, SourceFile,} from "ts-morph";
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
    },
    paths: {},
    components: {
        schemas: {},
    },
};

const typeRegistry: {
    [name: string]: boolean
} = {};

registerTypes(typesProject.getSourceFiles(), typeRegistry)

type Schema = {
    $ref: string;
};

function processEndpoints(sourceFile: SourceFile): { [path: string]: any } {
    const httpTypeRegex = /`HTTP\.(\w+) (.*)`/;  // regex to extract HTTP method and path from JSDoc comment

// Function to create a reference to a schema
    function createSchemaRef(name: string): Schema {
        return {
            $ref: `#/components/schemas/${name}`
        };
    }

// Create an OpenAPI paths object
    const paths: { [path: string]: any } = {};

// Find the LemmyHttp class
    const lemmyHttpClass = sourceFile.getClassOrThrow("LemmyHttp");

// Iterate over the methods of the class
    for (const method of lemmyHttpClass.getMethods()) {
        // Extract the name of the method
        const operationId = method.getName();

        // Extract the JSDoc comment
        const comment = method.getJsDocs()[0]?.getDescription();

        // Extract the HTTP method and path from the JSDoc comment
        const httpInfoMatch = comment?.match(httpTypeRegex);
        if (!httpInfoMatch) {
            console.warn(`Could not extract HTTP info from comment: ${comment}`);
            continue;
        }

        const httpMethod = httpInfoMatch[1].toLowerCase();
        const path = httpInfoMatch[2];

        // Extract the parameter type
        const param = method.getParameters()[0];
        const paramType = param?.getType()?.getText();

        // Extract the return type
        const returnType = "";
        // const returnType = method.getReturnType().getText().match(/Promise<(.+)>/)[1];  // Assumes the return type is always a Promise

        // Create a path item for this method
        paths[path] = {
            [httpMethod]: {
                operationId,
                requestBody: {
                    content: {
                        'application/json': {
                            schema: createSchemaRef(paramType),
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: createSchemaRef(returnType),
                            },
                        },
                    },
                },
            },
        };
    }

    return paths
}



const paths = processEndpoints(httpProject.getSourceFileOrThrow("http.ts"));
openAPISchema.paths = paths;

processSchemas(typesProject.getSourceFiles(), typeRegistry, openAPISchema)

console.log(JSON.stringify(openAPISchema, null, 2));

fs.writeFileSync(outputFile, JSON.stringify(openAPISchema, null, 2))