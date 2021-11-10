import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import type { IServiceRequestRepository, IterableQueryResult, QueryResult } from '../../types';

@injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequest, ServiceRequestComment } = databaseEngine.models;
        const record = await ServiceRequest.create(data);
        if (Object.hasOwnProperty.call(data, 'comments')) {
            // @ts-ignore
            for (const comment of data.comments) {
                // @ts-ignore
                await ServiceRequestComment.create(Object.assign({}, comment, { serviceRequestId: record.id }));
            }
        }
        return record;
    }

    async findOne(clientId: string, id: string): Promise<QueryResult> {
        const { ServiceRequest, ServiceRequestComment } = databaseEngine.models;
        const params = { where: { clientId, id }, include: [{ model: ServiceRequestComment, as: 'comments' }], };
        return await ServiceRequest.findOne(params);
    }

    async findAll(clientId: string, where: Record<string, unknown> = {}): Promise<[IterableQueryResult, number]> {
        const { ServiceRequest } = databaseEngine.models;
        const params = { where: Object.assign({}, where, { clientId }), raw: true, nest: true };
        const records = await ServiceRequest.findAll(params);
        return [records, records.length];
    }

}
