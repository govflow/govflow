import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import type { IServiceRequestRepository, IterableQueryResult, QueryResult } from '../../types';
import { requestWithout311 } from '../open311/helpers';

@injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequest, ServiceRequestComment } = databaseEngine.models;
        const record = await ServiceRequest.create(data);
        if (Object.hasOwnProperty.call(data, 'comments')) {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            for (const comment of data.comments) {
                // @ts-ignore
                await ServiceRequestComment.create(Object.assign({}, comment, { serviceRequestId: record.id }));
            }
            /* eslint-enable @typescript-eslint/ban-ts-comment */
        }
        return requestWithout311(record);
    }

    async findOne(clientId: string, id: string): Promise<QueryResult> {
        const { ServiceRequest, ServiceRequestComment } = databaseEngine.models;
        const params = { where: { clientId, id }, include: [{ model: ServiceRequestComment, as: 'comments' }], };
        const record = await ServiceRequest.findOne(params);
        return requestWithout311(record);
    }

    async findAll(clientId: string, where: Record<string, unknown> = {}): Promise<[IterableQueryResult, number]> {
        const { ServiceRequest } = databaseEngine.models;
        const params = { where: Object.assign({}, where, { clientId }) };
        const records = await ServiceRequest.findAll(params);
        return [records.map(requestWithout311), records.length];
    }

}
