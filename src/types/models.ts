import { ModelAttributes, ModelOptions } from 'sequelize/types';

export interface Model {
    name: string,
    attributes: ModelAttributes,
    options?: ModelOptions
}
