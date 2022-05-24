import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { appIds } from '../../registry/service-identifiers';
import { AppConfig, IServiceRepository, Models, QueryParamsAll, ServiceAttributes, ServiceInstance } from '../../types';

@injectable()
export class ServiceRepository implements IServiceRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config
    }

    async create(data: ServiceAttributes): Promise<ServiceAttributes> {
        const { Service } = this.models;
        return await Service.create(data) as ServiceInstance;
    }

    async update(jurisdictionId: string, id: string, data: Partial<ServiceAttributes>): Promise<ServiceAttributes> {
        const { Service } = this.models;
        const allowUpdateFields = ['name', 'description', 'type'];
        const safeData = Object.assign({}, _.pick(data, allowUpdateFields), { id, jurisdictionId });
        const record = await Service.findByPk(id) as ServiceInstance;
        for (const [key, value] of Object.entries(safeData)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            record[key] = value;
        }
        return await record.save();
    }

    async findOne(jurisdictionId: string, id: string): Promise<ServiceAttributes> {
        const { Service } = this.models;
        const params = {
            where: { jurisdictionId, id },
        };
        const record = await Service.findOne(params) as ServiceInstance;
        return record;
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[ServiceAttributes[], number]> {
        const { Service } = this.models;
        const records = await Service.findAll({
            where: Object.assign({}, queryParams?.whereParams, { jurisdictionId }),
        }) as ServiceInstance[];
        return [records, records.length];
    }

}
