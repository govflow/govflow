import _ from 'lodash';
import type { Model } from 'sequelize';

export const open311ExcludeFields = [
    'service_code',
    'service_name',
    'metadata',
    'type',
    'keywords',
    'group'
];

export const open311Fields = [...open311ExcludeFields, 'description'];

export function serviceAs311(service: Model<any, any>): Record<string, unknown> {
    return _.pick(service, open311Fields);
}

export function serviceWithout311(service: Model<any, any> | null): Record<string, unknown> {
    return _.omit(service, open311ExcludeFields);
}
