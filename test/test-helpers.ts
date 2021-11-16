import chai from 'chai';
import _ from 'lodash';
import { cleanQueryParams } from '../src/helpers';

describe('Unit test helper behaviour.', function () {

    it('cleans query params when undefined', async function () {
        const queryParams = undefined;
        const cleaned = cleanQueryParams(queryParams);
        chai.assert(_.isObject(cleaned));
    });

    it('cleans query params when partially defined', async function () {
        const queryParams = {
            whereParams: { id: '1' },
            selectFields: undefined
        };
        const cleaned = cleanQueryParams(queryParams);
        const keys = Object.keys(cleaned);
        chai.assert(_.isObject(cleaned));
        chai.assert.equal(keys.length, 1);
        chai.assert(keys.includes('whereParams'))
    });

    it('passes through a fully QueryParamsAll object', async function () {
        const queryParams = {
            whereParams: { id: '1' },
            selectFields: ['field1', 'field2'],
            orderFields: ['field3', 'field4'],
            limit: 100,
            offset: 100
        };
        const cleaned = cleanQueryParams(queryParams);
        const keys = Object.keys(cleaned);
        chai.assert(_.isObject(cleaned));
        chai.assert.equal(keys.length, 5);
        chai.assert(keys.includes('whereParams'))
        chai.assert(keys.includes('selectFields'))
        chai.assert(keys.includes('orderFields'))
        chai.assert(keys.includes('limit'))
        chai.assert(keys.includes('offset'))
    });

    it('passes through a fully QueryParamsOne object', async function () {
        const queryParams = {
            whereParams: { id: '1' },
            selectFields: ['field1', 'field2'],
        };
        const cleaned = cleanQueryParams(queryParams);
        const keys = Object.keys(cleaned);
        chai.assert(_.isObject(cleaned));
        chai.assert.equal(keys.length, 2);
        chai.assert(keys.includes('whereParams'))
        chai.assert(keys.includes('selectFields'))
    });

});
