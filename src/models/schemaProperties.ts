export interface SchemaProperties {
    [name: string]: {
        format?: string;
        type?: string;
        nullable?: boolean;
        allOf?: [
            { $ref?: string; }
        ]
        array?: string;
        items?: {
            $ref?: string;
            type?: string;
        }
        $ref?: string;
        enum?: string[];
    };
}