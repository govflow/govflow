import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import type { IServiceRequestRepository, IterableQueryResult, QueryResult } from '../../types';

@injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {

    async findOne(id: string, clientId: string): Promise<QueryResult> {
        return await databaseEngine.models.ServiceRequest.findOne({
            where: { id, clientId },
            raw: true,
        });
    }

    async findAll(clientId: string): Promise<[IterableQueryResult, number]> {
        const { rows: records, count } = await databaseEngine.models.ServiceRequest.findAndCountAll({
            where: { clientId },
            raw: true,
        });
        return [records, count];
    }

    async create(clientId: string, payload: Record<string, unknown>): Promise<QueryResult> {
        return await databaseEngine.models.ServiceRequest.create(payload);
    }

}
