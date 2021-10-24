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
        const records = await databaseEngine.models.ServiceRequest.findAll({
            where: { clientId },
            raw: true,
        });
        return [records, records.length];
    }

    async create(clientId: string, payload: Record<string, unknown>): Promise<QueryResult> {
        return await databaseEngine.models.ServiceRequest.create(payload);
    }

}
