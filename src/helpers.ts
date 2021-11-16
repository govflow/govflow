import type { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import type { QueryParamsAll, QueryParamsOne } from '../src/types';

/* eslint-disable */
// @ts-ignore
export function wrapHandler(handler) {
    return (req: Request, res: Response, next: NextFunction) => {
        handler(req, res, next).catch(next)
    }
}
/* eslint-enable */

export function cleanQueryParams(queryParams: QueryParamsAll | QueryParamsOne | undefined): Record<string, unknown> {
    if (_.isNil(queryParams)) { return {}; }
    return _.omitBy(queryParams, _.isNil);
}

export function queryParamstoSequelize(queryParams: QueryParamsAll | QueryParamsOne | undefined): Record<string, unknown> {
    type nameMapType = {
        [key: string]: string
    }
    const nameMap: nameMapType = {
        'whereParams': 'where',
        'selectFields': 'attributes',
        'orderFields': 'order',
        'limit': 'limit',
        'offset': 'offset'
    }
    const cleaned = cleanQueryParams(queryParams);
    return _.mapKeys(cleaned, (v: unknown, k: string) => { return nameMap[k]; })
}
