import {Project,} from "ts-morph";
import * as fs from "fs";
import {OpenApiSchema} from "./openApiSchema";
import {registerTypes} from "./registerTypes";
import {processSchemas} from "./processSchemas";

const project = new Project();
project.addSourceFilesAtPaths("/Users/michael/Development/lemmy-js-client/src/types/*.ts");

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

fs.writeFileSync('openapi.json', JSON.stringify(openAPISchema, null, 2))