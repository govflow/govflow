import { Model, ModelAttributes, ModelOptions } from 'sequelize/types';

export interface ModelDefinition {
    name: string,
    attributes: ModelAttributes,
    options?: ModelOptions
}

export type ReturnedModel = Model | null;
