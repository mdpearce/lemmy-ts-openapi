import {SourceFile} from "ts-morph";
import {PathSchema} from "../models/pathSchema";
import {mapTsTypeToJsonSchemaType} from "../utils/mapTsTypeToJsonSchemaType";
import {isReferenceType} from "../utils/isReferenceType";

export function processPaths(sourceFile: SourceFile, typeRegistry: {
    [name: string]: boolean
}): { [path: string]: any } {
    const httpTypeRegex = /`HTTP\.(\w+) (.*)`/;  // regex to extract HTTP method and path from JSDoc comment

    function createSchemaRef(name: string): PathSchema {
        return {
            $ref: `#/components/schemas/${name}`
        };
    }

    function createSchemaPrimitive(typeName: string): PathSchema {
        return {
            type: mapTsTypeToJsonSchemaType(typeName)
        }
    }

    const paths: { [path: string]: any } = {};

    const lemmyHttpClass = sourceFile.getClassOrThrow("LemmyHttp");

    for (const method of lemmyHttpClass.getMethods()) {
        // Extract the name of the method
        const operationId = method.getName();

        // Extract the JSDoc comment
        const comment = method.getJsDocs()[0]?.getDescription();
        const summary = comment?.trim()?.slice(0, comment?.trim().indexOf("\n\n"))

        // Extract the HTTP method and path from the JSDoc comment
        const httpInfoMatch = comment?.match(httpTypeRegex);
        if (!httpInfoMatch) {
            console.warn(`Could not extract HTTP info from comment: ${comment} in method: ${operationId}`);
            continue;
        }

        const httpMethod = httpInfoMatch[1].toLowerCase();
        const path = httpInfoMatch[2];

        // Extract the parameter type

        const param = method.getParameters()[0];
        const paramType = param.getType().getSymbol()?.getName() || "UNDEFINED";

        // Extract the return type
        const body = method.getBodyText()?.replace('\n', '').replace('\n', '')
        const returnType = body?.match(/return\s+this\.#wrapper<\s*(\w+),\s*(\w+)\s*>/)?.at(2)
        if (returnType === undefined) {
            throw new Error("Could not determine return type")
        }

        param.getChildren()[2].getType().getProperties()[0].getDeclarations()[0]

        const pathParams = param.getTypeNodeOrThrow().getType().getProperties().map(prop => {
            const declaredProp = prop.getDeclarations()[0]
            const isOptional = declaredProp.getSymbolOrThrow().isOptional()
            const name = declaredProp.getSymbolOrThrow().getName()
            const typeName = declaredProp.getType().getText()

            let schemaType: PathSchema
            if (isReferenceType(declaredProp.getType(), typeRegistry)) {
                schemaType = createSchemaRef(typeName)
            } else {
                schemaType = createSchemaPrimitive(typeName)
            }

            return {
                in: "query",
                name: name,
                required: !isOptional,
                schema: schemaType
            }
        })

        // Create a path item for this method
        paths[path] = {
            [httpMethod]: {
                operationId,
                parameters: pathParams,
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
                summary: summary,
            },
        };
    }

    return paths
}