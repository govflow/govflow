import _ from 'lodash';
import type { QueryResult } from '../../types';

export const open311ServiceExcludeFields = [
    'service_code',
    'service_name',
    'metadata',
    'type',
    'keywords',
];

export const open311ServiceFields = [...open311ServiceExcludeFields, 'description', 'group'];

export const open311RequestExcludeFields = [
    'media_url',
    'address_id',
    'first_name',
    'last_name',
    'service_code'
];

export const open311RequestFields = [
    ...open311RequestExcludeFields,
    'id',
    'description',
    'address',
    'geometry',
];

export function serviceAs311(service: QueryResult): Record<string, unknown> {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    return _.pick(service.get(), open311ServiceFields);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
}

export function serviceWithout311(service: QueryResult): Record<string, unknown> {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    return _.omit(service.get(), open311ServiceExcludeFields);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
}

export function requestAs311(request: QueryResult): Record<string, unknown> {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    return _.pick(request.get(), open311RequestFields);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
}

export function requestWithout311(request: QueryResult): Record<string, unknown> {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    return _.omit(request.get(), open311RequestExcludeFields);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
}
