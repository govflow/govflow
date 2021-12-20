import { injectable } from 'inversify';
import _ from 'lodash';
import { IServiceRepository, QueryParamsAll, ServiceAttributes } from '../../types';

@injectable()
export class ServiceRepository implements IServiceRepository {

    async create(data: ServiceAttributes): Promise<ServiceAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { Service } = this.models;
        /* eslint-enable */
        return await Service.create(data);
    }

    async update(jurisdictionId: string, id: string, data: Partial<ServiceAttributes>): Promise<ServiceAttributes> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const { Service } = this.models;
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        const allowUpdateFields = ['name', 'description', 'type'];
        const safeData = Object.assign({}, _.pick(data, allowUpdateFields), { id, jurisdictionId });
        const record = await Service.findByPk(id);
        for (const [key, value] of Object.entries(safeData)) {
            record[key] = value;
        }
        return await record.save();
    }

    async findOne(jurisdictionId: string, id: string): Promise<ServiceAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { Service } = this.models;
        /* eslint-enable */
        const params = {
            where: { jurisdictionId, id },
        };
        const record = await Service.findOne(params);
        return record;
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[ServiceAttributes[], number]> {
        /* eslint-disable */
        //@ts-ignore
        const { Service } = this.models;
        /* eslint-enable */
        const records = await Service.findAll({
            where: Object.assign({}, queryParams?.whereParams, { jurisdictionId }),
        });
        return [records, records.length];
    }

}
