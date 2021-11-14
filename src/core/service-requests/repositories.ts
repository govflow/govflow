import { injectable } from 'inversify';
import _ from 'lodash';
import { databaseEngine } from '../../db';
import type { IServiceRequestRepository, IterableQueryResult, QueryResult } from '../../types';
import { requestWithout311 } from '../open311/helpers';
import { REQUEST_STATUSES } from './models';

@injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequest } = databaseEngine.models;
        const record = await ServiceRequest.create(data);
        return requestWithout311(record);
    }

    async update(clientId: string, id: string, data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequest, ServiceRequestComment } = databaseEngine.models;
        const allowUpdateFields = ['assignedTo', 'status', 'address', 'geometry', 'address_id']
        const { comments } = data;
        const safeData = Object.assign({}, _.pick(data, allowUpdateFields), { id, clientId });
        const record = await ServiceRequest.findByPk(id);
        for (const [key, value] of Object.entries(safeData)) {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            record[key] = value;
            /* eslint-enable @typescript-eslint/no-unused-vars */
        }
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        record.save()
        /* eslint-enable @typescript-eslint/no-unused-vars */
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

    async findStatusList(clientId: string): Promise<Record<string, string>> {
        return Promise.resolve(REQUEST_STATUSES);
    }

    async createComment(clientId: string, serviceRequestId: string, data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequestComment } = databaseEngine.models;
        const record = await ServiceRequestComment.create(Object.assign({}, data, { serviceRequestId }));
        return record;
    }

    async updateComment(clientId: string, serviceRequestId: string, serviceRequestCommentId: string, data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequestComment } = databaseEngine.models;
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const record = await ServiceRequestComment.findByPk(serviceRequestCommentId);
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        for (const [key, value] of Object.entries(data)) {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            record[key] = value;
            /* eslint-enable @typescript-eslint/no-unused-vars */
        }
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        record.save()
        return record;
    }



}
