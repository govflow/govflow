import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IServiceRepository, IterableQueryResult, QueryResult } from '../../types';

@injectable()
export class ServiceRepository implements IServiceRepository {

    async findOne(clientId: string, id: string): Promise<QueryResult> {
        return await databaseEngine.models.Service.findOne({
            where: { clientId, id },
            raw: true,
        });
    }

    async findAll(clientId: string): Promise<[IterableQueryResult, number]> {
        const { rows, count } = await databaseEngine.models.Service.findAndCountAll({
            where: { clientId },
            raw: true,
        });
        return [rows, count];
    }

}
