export interface JSONSchema {
    $schema: string;
    $id: string;
    required: string[];
    title?: string;
    description?: string;
    type: string;
    properties: Record<string, unknown> | unknown[];
}

export type JSONBTarget = Record<string, unknown> | unknown[];
