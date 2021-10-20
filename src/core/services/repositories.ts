import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IServiceRepository, IterableQueryResult, QueryResult } from '../../types';

@injectable()
export class ServiceRepository implements IServiceRepository {

    async findOne(clientId: string, id: string): Promise<QueryResult> {
        const { Service } = databaseEngine.models;
        return await Service.findOne({
            where: { clientId, id },
            include: [
                { model: Service, as: 'parent' },
                { model: Service, as: 'children' },
            ]
        });
    }

    async findAll(clientId: string): Promise<[IterableQueryResult, number]> {
        const { Service } = databaseEngine.models;
        const { rows: records, count } = await Service.findAndCountAll({
            where: { clientId },
        });
        return [records, count];
    }

    async create(clientId: string, payload: Record<string, unknown>): Promise<QueryResult> {
        const { Service } = databaseEngine.models;
        // handle group attribute from Open311
        const { group } = payload;
        delete payload.group;
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const [parent, _] = await Service.findOrCreate({
            where: { name: group, id: group },
        });
        /* eslint-enable @typescript-eslint/no-unused-vars */
        /* eslint-disable */
        // @ts-ignore
        const params = Object.assign({}, payload, { clientId }, { parentId: parent.id });
        /* eslint-enable */
        return await Service.create(params);
    }

}
