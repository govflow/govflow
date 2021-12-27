import merge from 'deepmerge';
import { inject, injectable } from 'inversify';
import { queryParamsToSequelize } from '../../helpers';
import { appIds } from '../../registry/service-identifiers';
import type { AppSettings, EventAttributes, EventInstance, IEventRepository, Models, QueryParamsAll } from '../../types';

@injectable()
export class EventRepository implements IEventRepository {

    models: Models;
    settings: AppSettings;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppSettings) settings: AppSettings,
    ) {
        this.models = models;
        this.settings = settings
    }

    async findOne(jurisdictionId: string, id: string): Promise<EventAttributes> {
        const { Event } = this.models;
        const params = { where: { id, jurisdictionId } };
        return await Event.findOne(params) as EventInstance;
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[EventAttributes[], number]> {
        const { Event } = this.models;
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const records = await Event.findAll(params) as EventInstance[];
        return [records, records.length];
    }

    async create(data: EventAttributes): Promise<EventAttributes> {
        const { Event } = this.models;
        const params = data;
        return await Event.create(params) as EventInstance;
    }

}
