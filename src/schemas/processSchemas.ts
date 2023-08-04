import {SourceFile} from "ts-morph";
import {OpenApiSchema} from "../models/openApiSchema";
import {Schema} from "../models/schema";
import {handleProperty} from "../properties/handleProperty";

export function processSchemas(sourceFiles: SourceFile[], typeRegistry: {
    [name: string]: boolean
}, openAPISchema: OpenApiSchema) {
    for (const sourceFile of sourceFiles) {
        const exportedInterface = sourceFile.getInterfaces().filter(dec => dec.isExported())
        const exportedTypeAliases = sourceFile.getTypeAliases().filter(dec => dec.isExported())

        for (const typeAlias of exportedTypeAliases) {
            if (!typeAlias) {
                continue;
            }

            const schema: Schema = {
                type: "object",
                properties: {}
            }

            const type = typeAlias.getType()
            if (type.isString() || type.isNumber() || type.isBoolean()) {
                schema.type = type.getText()
            } else if (type.isUnion() && type.getUnionTypes().every(t => t.isStringLiteral())) {
                schema.type = "string";
                schema.enum = type.getUnionTypes().map(t => t.getText().replace("\"", "").replace("\"", ""));
            } else if (type.isUnion()) {
                schema.type = "object";
                schema.oneOf = type.getUnionTypes().map(t => {
                    const subSchema: Schema = {type: "object", required: [], properties: {}};
                    t.getProperties().forEach(prop => {
                        const declaredType = prop.getDeclarations()[0].getType()
                        handleProperty(prop.getName(), declaredType, subSchema, prop.isOptional(), typeRegistry)
                    })
                    return subSchema
                })
            }

            openAPISchema.components.schemas[typeAlias.getName()] = schema;
        }

        for (const iFace of exportedInterface) {
            if (!iFace) {
                continue;
            }
            const schema: Schema = {
                type: "object",
                properties: {},
            };
            for (const prop of iFace.getProperties()) {
                let required = !prop.hasQuestionToken()
                // Do not add required properties for response and view schemas (ugly)
                // those are just API responses and or views from those responses
                // and they dont have any required properties
                if (iFace.getName().includes("Response") || iFace.getName().includes("View")) {
                    required = false;
                }
                // Add required properties to models which really require them (forms)
                if (required && schema.required == undefined) {
                    schema.required = []
                }
                handleProperty(prop.getName(), prop.getType(), schema, prop.hasQuestionToken(), typeRegistry)
            }
            openAPISchema.components.schemas[iFace.getName()] = schema;
        }
    }
}