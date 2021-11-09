import chai from 'chai';
import { isValidToSchema, serviceExtraAttrsSchema } from '../src/core/schemas';
import { invalidServiceDefinitionData, validServiceDefinitionData } from './fixtures/open311';

describe('Schemas should validate data.', function () {

    it('should pass validation against serviceExtraAttrsSchema', async function () {
        let validator = isValidToSchema(serviceExtraAttrsSchema);
        let response = validator(validServiceDefinitionData);
        chai.assert(response.valid === true);
    });

    it('should fail validation against serviceExtraAttrsSchema', async function () {
        let validator = isValidToSchema(serviceExtraAttrsSchema);
        let response = validator(invalidServiceDefinitionData);
        chai.assert(response.valid === false);
    });

});
