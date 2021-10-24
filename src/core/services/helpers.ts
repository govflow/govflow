import _ from 'lodash';

export function serviceAs311(service: Record<string, any>) {
    return _.pick(service, [
        'service_code', 'service_name', 'description', 'metadata', 'type', 'keywords', 'group'
    ]);
}

export function serviceWithout311(service: Record<string, any>) {
    return _.pick(service, [
        'id', 'name', 'description', 'type', 'tags', 'parent', 'children'
    ]);
}