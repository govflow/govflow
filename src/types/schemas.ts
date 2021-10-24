export interface JSONSchema {
    $schema: string,
    $id: string,
    required: Array<string>,
    title?: string,
    description?: string,
    type: string,
    properties: Record<string, unknown> | Array<unknown>
}

export type JSONBTarget = Record<string, unknown> | Array<unknown>