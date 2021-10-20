import chai from 'chai';
import { isValidToSchema, serviceExtraAttrsSchema } from '../src/core/services/schemas';
import { invalidServiceDefinitionPayload, validServiceDefinitionPayload } from './fixtures/open311';

describe('Schemas should validate data.', () => {

    it('should pass validation against serviceExtraAttrsSchema', async () => {
        let validator = isValidToSchema(serviceExtraAttrsSchema);
        let response = validator(validServiceDefinitionPayload);
        chai.assert(response.valid === true);
    });

    it('should fail validation against serviceExtraAttrsSchema', async () => {
        let validator = isValidToSchema(serviceExtraAttrsSchema);
        let response = validator(invalidServiceDefinitionPayload);
        chai.assert(response.valid === false);
    });

});
