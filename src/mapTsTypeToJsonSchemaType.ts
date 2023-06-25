export function mapTsTypeToJsonSchemaType(tsType: string): string {
    switch (tsType) {
        case "string":
            return "string";
        case "number":
            return "number";
        case "boolean":
            return "boolean";
        case "any":
            return "any";
        default:
            return "unknown";
    }
}