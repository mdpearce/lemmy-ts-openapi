export type PathSchema = {
    $ref: string;
} | {
    type: string
} | {
    type: string,
    items: { type: string }
};