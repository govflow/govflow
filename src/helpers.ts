import merge from 'deepmerge';
import type { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { Op } from 'sequelize';
import type { QueryParamsAll, QueryParamsOne, ServiceRequestFilterParams } from '../src/types';

type nameMapType = {
    [key: string]: string
}

/* eslint-disable */
// @ts-ignore
export function wrapHandler(handler) {
    return (req: Request, res: Response, next: NextFunction) => {
        handler(req, res, next).catch(next)
    }
}
/* eslint-enable */

export function cleanQueryParams(queryParams: QueryParamsAll | QueryParamsOne | ServiceRequestFilterParams | undefined): Record<string, unknown> {
    if (_.isNil(queryParams)) { return {}; }
    return _.omitBy(queryParams, _.isNil);
}

export function queryParamsToSequelize(queryParams: QueryParamsAll | QueryParamsOne | undefined): Record<string, unknown> {
    const nameMap: nameMapType = {
        'whereParams': 'where',
        'selectFields': 'attributes',
        'groupFields': 'group',
        'orderFields': 'order',
        'limit': 'limit',
        'offset': 'offset'
    }
    const cleaned = cleanQueryParams(queryParams);
    return _.mapKeys(cleaned, (v: unknown, k: string) => { return nameMap[k]; })
}

export function serviceRequestFiltersToSequelize(filterParams: ServiceRequestFilterParams): Record<string, unknown> {
    const cleaned = cleanQueryParams(filterParams);
    let whereParams = {};
    let createdAtParams = {};

    if (!_.isNil(cleaned.dateFrom)) {
        const dateFrom = new Date(cleaned.dateFrom as string);
        createdAtParams = merge(createdAtParams, { [Op.gt]: dateFrom })
    }

    if (!_.isNil(cleaned.dateTo)) {
        const dateTo = new Date(cleaned.dateTo as string);
        createdAtParams = merge(createdAtParams, { [Op.lt]: dateTo })
    }

    if (!_.isNil(cleaned.status)) {
        whereParams = merge(whereParams, { status: cleaned.status })
    }

    if (!_.isNil(cleaned.assignedTo)) {
        whereParams = merge(whereParams, { assignedTo: cleaned.assignedTo })
    }

    if (Object.getOwnPropertySymbols(createdAtParams).length > 0) {
        whereParams = merge(whereParams, { createdAt: createdAtParams });
    }

    const toSequelize = { whereParams };
    return toSequelize;
}
