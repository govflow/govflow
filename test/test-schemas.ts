import chai from 'chai';
import { isValidToSchema, serviceExtraAttrsSchema } from '../src/core/services/schemas';

describe('Schemas should validate data.', () => {

    it('should pass validation against serviceExtraAttrsSchema', async () => {
        let validator = isValidToSchema(serviceExtraAttrsSchema);
        let data = {
            // example service definition response from https://wiki.open311.org/GeoReport_v2/
            'service_code': 'DMV66',
            'attributes': [
                {
                    'variable': true,
                    'code': 'WHISHETN',
                    'datatype': 'singlevaluelist',
                    'required': true,
                    'datatype_description': null,
                    'order': 1,
                    'description': 'What is the ticket/tag/DL number?',
                    'values': [
                        {
                            'key': 123,
                            'name': 'Ford'
                        },
                        {
                            'key': 124,
                            'name': 'Chrysler'
                        }
                    ]
                }
            ]
        };
        let response = validator(data);
        chai.assert(response.valid === true);
    });

    it('should fail validation against serviceExtraAttrsSchema', async () => {
        let validator = isValidToSchema(serviceExtraAttrsSchema);
        let data = {
            // similar but invalid data
            'service_code': 'DMV66',
            'attrs': [
                {
                    'variable': true,
                    'code': 'WHISHETN',
                    'datatype': 'singlevaluelist',
                    'required': true,
                    'datatype_description': null,
                    'order': 1,
                    'description': 'What is the ticket/tag/DL number?',
                    'values': [
                        {
                            'key': 123,
                            'name': 'Ford'
                        },
                        {
                            'key': 124,
                            'name': 'Chrysler'
                        }
                    ]
                }
            ]
        };
        let response = validator(data);
        chai.assert(response.valid === false);
    });

});
