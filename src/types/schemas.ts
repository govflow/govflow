export interface JSONSchema {
    $schema: string,
    $id: string,
    required: Array<string>,
    title?: string,
    description?: string,
    type: string,
    properties: {} | []
}
