import { validate as jsonSchemaValidate, ValidatorResult } from 'jsonschema';
import { homepage } from '../../package.json';
import { JSONBTarget, JSONSchema } from '../types';

export function isValidToSchema(schema: JSONSchema): (value: JSONBTarget) => ValidatorResult {
    return (value: JSONBTarget): ValidatorResult => {
        return jsonSchemaValidate(value, schema)

    }
}

export const eventActorSchema: JSONSchema = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    '$id': `${homepage}/src/core/schemas/event-actor-schema.json`,
    'title': 'Event Actor Schema',
    'description': 'Event actors can be a number of different entities represented by models, or, the system itself.',
    'type': 'object',
    'required': ['id', 'name', 'type'],
    'properties': {
        'id': { 'type': 'string' },
        'name': { 'type': 'string' },
        'type': { 'type': 'string' },
    }
}

export const serviceExtraAttrsSchema: JSONSchema = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    '$id': `${homepage}/src/core/schemas/service-attr-schema.json`,
    'title': 'Service Attributes Schema',
    'description': 'A service can declare additional attributes. When it does, they are declared according to this schema.',
    'type': 'object',
    'required': ['service_code', 'attributes'],
    'properties': {
        'service_code': {
            'type': 'string'
        },
        'attributes': {
            'type': 'array',
            'items': {
                'type': 'object',
                'required': ['variable', 'code', 'datatype', 'required', 'values'],
                'properties': {
                    'variable': {
                        'type': 'boolean'
                    },
                    'code': {
                        'type': 'string'
                    },
                    'datatype': {
                        'type': 'string',
                        'enum': ['string', 'number', 'datetime', 'text', 'singlevaluelist', 'multivaluelist']
                    },
                    'required': {
                        'type': 'boolean'
                    },
                    'datatype_description': {
                        'type': ['string', 'null']
                    },
                    'order': {
                        'type': 'number'
                    },
                    'description': {
                        'type': 'string'
                    },
                    'values': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'key': { 'type': ['number', 'string'] },
                                'value': { 'type': ['number', 'string'] }
                            }
                        }
                    }
                }
            }
        }
    }
}