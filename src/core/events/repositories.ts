import merge from 'deepmerge';
import { injectable } from 'inversify';
import { queryParamsToSequelize } from '../../helpers';
import type { EventAttributes, IEventRepository, QueryParamsAll } from '../../types';

@injectable()
export class EventRepository implements IEventRepository {

    async findOne(jurisdictionId: string, id: string): Promise<EventAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { Event } = this.models;
        /* eslint-enable */
        const params = { where: { id, jurisdictionId } };
        return await Event.findOne(params);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[EventAttributes[], number]> {
        /* eslint-disable */
        //@ts-ignore
        const { Event } = this.models;
        /* eslint-enable */
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const records = await Event.findAll(params);
        return [records, records.length];
    }

    async create(data: EventAttributes): Promise<EventAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { Event } = this.models;
        /* eslint-enable */
        const params = data;
        return await Event.create(params);
    }

}