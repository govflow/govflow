import _ from 'lodash';
import type { QueryResult } from '../../types';

export const open311ExcludeFields = [
    'service_code',
    'service_name',
    'metadata',
    'type',
    'keywords',
    'group'
];

export const open311Fields = [...open311ExcludeFields, 'description'];

export function serviceAs311(service: QueryResult): Record<string, unknown> {
    return _.pick(service, open311Fields);
}

export function serviceWithout311(service: QueryResult): Record<string, unknown> {
    return _.omit(service, open311ExcludeFields);
}
