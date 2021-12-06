import { injectable } from 'inversify';
import _ from 'lodash';
import { IServiceRepository, IterableQueryResult, QueryParamsAll, QueryResult } from '../../types';

@injectable()
export class ServiceRepository implements IServiceRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { Service } = this.models;
        /* eslint-enable */
        return await Service.create(data);
    }

    async update(jurisdictionId: string, id: string, data: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const { Service } = this.models;
        const allowUpdateFields = ['name', 'description', 'type'];
        const safeData = Object.assign({}, _.pick(data, allowUpdateFields), { id, jurisdictionId });
        const record = await Service.findByPk(id);
        for (const [key, value] of Object.entries(safeData)) {
            record[key] = value;
        }
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        return await record.save();
    }

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
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

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
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
