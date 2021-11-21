import merge from 'deepmerge';
import { injectable } from 'inversify';
import { queryParamsToSequelize } from '../../helpers';
import type { IEventRepository, IterableQueryResult, QueryParamsAll, QueryResult } from '../../types';

@injectable()
export class EventRepository implements IEventRepository {

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
        //@ts-ignore
        const { Event } = this.models;
        const params = { where: { id, jurisdictionId }, raw: true, nest: true };
        return await Event.findOne(params);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
        //@ts-ignore
        const { Event } = this.models;
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const records = await Event.findAll(params);
        return [records, records.length];
    }

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        //@ts-ignore
        const { Event } = this.models;
        const params = data;
        return await Event.create(params);
    }

}