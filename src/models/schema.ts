import {SchemaProperties} from "./schemaProperties";

export interface Schema {
    oneOf?: Schema[];
    enum?: string[];
    required?: string[];
    type: string;
    properties: SchemaProperties;
}