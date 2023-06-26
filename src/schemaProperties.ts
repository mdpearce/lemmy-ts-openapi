export interface SchemaProperties {
    [name: string]: {
        format?: string;
        type?: string;
        nullable?: boolean;
        array?: string;
        items?: {
            $ref?: string;
            type?: string;
        }
        $ref?: string;
    };
}