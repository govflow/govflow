import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import type { IEventRepository, IterableQueryResult, QueryResult } from '../../types';

@injectable()
export class EventRepository implements IEventRepository {

    async findOne(clientId: string, id: string): Promise<QueryResult> {
        const { Event } = databaseEngine.models;
        const params = { where: { id, clientId }, raw: true, nest: true };
        return await Event.findOne(params);
    }

    async findAll(clientId: string, where: Record<string, any>): Promise<[IterableQueryResult, number]> {
        const { Event } = databaseEngine.models;
        const params = { where: Object.assign({}, where, { clientId }), raw: true, nest: true };
        const records = await Event.findAll(params);
        return [records, records.length];
    }

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { Event } = databaseEngine.models;
        const params = data;
        return await Event.create(params);
    }

}