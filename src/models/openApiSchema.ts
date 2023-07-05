import {Schema} from "./schema";

export interface OpenApiSchema {
    openapi: string;
    info: {
        version: string;
        title: string;
    };
    paths: any;
    components: {
        schemas: {
            [name: string]: Schema;
        };
        securitySchemes: {
            [name: string]: {
                type: string,
                in: string,
                name: string
            }
        }
    };
}