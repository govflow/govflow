import { injectable } from 'inversify';
import { IServiceRepository, IterableQueryResult, QueryParamsAll, QueryResult } from '../../types';
import { open311ServiceExcludeFields, serviceWithout311 } from '../open311/helpers';

@injectable()
export class ServiceRepository implements IServiceRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        //@ts-ignore
        const { Service } = this.models;
        return await Service.create(data);
    }

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
        //@ts-ignore
        const { Service } = this.models;
        const params = {
            where: { jurisdictionId, id },
            include: [
                { model: Service, as: 'parent', attributes: { exclude: open311ServiceExcludeFields } },
                { model: Service, as: 'children', attributes: { exclude: open311ServiceExcludeFields } },
            ]
        }
        const record = await Service.findOne(params);
        return serviceWithout311(record);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
        //@ts-ignore
        const { Service } = this.models;
        const records = await Service.findAll({
            where: Object.assign({}, queryParams?.whereParams, { jurisdictionId }),
            include: [
                { model: Service, as: 'parent', attributes: { exclude: open311ServiceExcludeFields } },
                { model: Service, as: 'children', attributes: { exclude: open311ServiceExcludeFields } },
            ]
        });
        return [records.map(serviceWithout311), records.length];
    }

}
