import { injectable } from 'inversify';
import _ from 'lodash';
import { databaseEngine } from '../../db';
import { queryParamstoSequelize } from '../../helpers';
import type { IEventRepository, IterableQueryResult, QueryParamsAll, QueryResult } from '../../types';

@injectable()
export class EventRepository implements IEventRepository {

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
        const { Event } = databaseEngine.models;
        const params = { where: { id, jurisdictionId }, raw: true, nest: true };
        return await Event.findOne(params);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
        const { Event } = databaseEngine.models;
        const params = _.merge({}, queryParamstoSequelize(queryParams), { where: { jurisdictionId } });
        const records = await Event.findAll(params);
        return [records, records.length];
    }

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { Event } = databaseEngine.models;
        const params = data;
        return await Event.create(params);
    }

}