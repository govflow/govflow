import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IServiceRepository, IterableQueryResult, QueryResult } from '../../types';
import { open311ExcludeFields, serviceWithout311 } from '../open311/helpers';

@injectable()
export class ServiceRepository implements IServiceRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { Service } = databaseEngine.models;
        return await Service.create(data);
    }

    async findOne(clientId: string, id: string): Promise<QueryResult> {
        const { Service } = databaseEngine.models;
        const params = {
            where: { clientId, id },
            include: [
                { model: Service, as: 'parent', attributes: { exclude: open311ExcludeFields } },
                { model: Service, as: 'children', attributes: { exclude: open311ExcludeFields } },
            ],
            raw: true,
            nest: true
        }
        const record = await Service.findOne(params);
        return serviceWithout311(record);
    }

    async findAll(clientId: string, whereParams: Record<string, unknown> = {}): Promise<[IterableQueryResult, number]> {
        const { Service } = databaseEngine.models;
        const records = await Service.findAll({
            where: Object.assign({}, whereParams, { clientId }),
            include: [
                { model: Service, as: 'parent', attributes: { exclude: open311ExcludeFields } },
                { model: Service, as: 'children', attributes: { exclude: open311ExcludeFields } },
            ],
            raw: true,
            nest: true
        });
        return [records.map(serviceWithout311), records.length];
    }

}
