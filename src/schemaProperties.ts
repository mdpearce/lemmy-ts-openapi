export interface SchemaProperties {
    [name: string]: {
        format?: string;
        type?: string;
        array?: string;
        items?: {
            $ref?: string;
            type?: string;
        }
        $ref?: string;
    };
}