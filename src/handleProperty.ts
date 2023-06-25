import {Type} from "ts-morph";
import {Schema} from "./schema";
import {isReferenceType} from "./isReferenceType";
import {mapTsTypeToJsonSchemaType} from "./mapTsTypeToJsonSchemaType";

export function handleProperty(name: string, type: Type, schema: Schema, isOptional: boolean, typeRegistry: {
    [name: string]: boolean
}) {
    if (type.isArray()) {
        if (isReferenceType(type, typeRegistry)) {
            schema.properties[name] = {
                type: "array",
                items: {
                    $ref: `#/components/schemas/${type.getArrayElementType()?.getSymbol()?.getName()}`
                }
            }
        } else {
            schema.properties[name] = {
                type: "array",
                items: {
                    type: mapTsTypeToJsonSchemaType(type.getArrayElementType()?.getText() ?? "")
                }
            }
        }
    } else if (type.isUnion()) {
        if (type.getUnionTypes().find(t => t.getText() === "File")) { // This is gross
            schema.properties[name] = {
                type: "string",
                format: "byte"
            };
        }
    } else {
        if (isReferenceType(type, typeRegistry)) {
            schema.properties[name] = {
                $ref: `#/components/schemas/${type.getSymbol()?.getName()}`
            };
        } else {
            schema.properties[name] = {
                type: mapTsTypeToJsonSchemaType(type.getText())
            }
        }
    }

    if (!isOptional) {
        schema.required.push(name);
    }
}