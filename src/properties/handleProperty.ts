import {Type} from "ts-morph";
import {Schema} from "../models/schema";
import {isReferenceType} from "../utils/isReferenceType";
import {mapTsTypeToJsonSchemaType} from "../utils/mapTsTypeToJsonSchemaType";

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
                },
                nullable: isOptional,
            }
        }
    } else if (type.isUnion()) {
        if (type.getUnionTypes().find(t => t.getText() === "File")) { // This is gross
            schema.properties[name] = {
                type: "string",
                format: "byte",
                nullable: isOptional,
            };
        } else if (type.getText() === "boolean") { // Why boolean types are Union types escapes me...
            schema.properties[name] = {
                type: "boolean",
                nullable: isOptional,
            }
        } else if (isReferenceType(type, typeRegistry)) {
            schema.properties[name] = {
                $ref: `#/components/schemas/${type.getSymbol()?.getName() ?? type.getAliasSymbol()?.getName()}`
            }
        }
    } else if (type.isLiteral()) {
        schema.properties[name] = {
            type: "string",
            enum: [
                type.getText()
            ],
        }
    } else {
        if (isReferenceType(type, typeRegistry)) {
            schema.properties[name] = {
                nullable: isOptional,
                allOf: [
                    {$ref : `#/components/schemas/${type.getSymbol()?.getName()}`}
                ],
            };
        } else {
            schema.properties[name] = {
                type: mapTsTypeToJsonSchemaType(type.getText()),
                nullable: isOptional,
            }
        }
    }

    if (schema.required !== undefined) {
        schema.required.push(name);
    }
}
