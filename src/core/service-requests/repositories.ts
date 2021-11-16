import merge from 'deepmerge';
import { injectable } from 'inversify';
import _ from 'lodash';
import { databaseEngine } from '../../db';
import { queryParamsToSequelize } from '../../helpers';
import type { IServiceRequestRepository, IterableQueryResult, QueryParamsAll, QueryResult } from '../../types';
import { requestWithout311 } from '../open311/helpers';
import { REQUEST_STATUSES } from './models';

@injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequest } = databaseEngine.models;
        const record = await ServiceRequest.create(data);
        return requestWithout311(record);
    }

    async update(jurisdictionId: string, id: string, data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequest } = databaseEngine.models;
        const allowUpdateFields = ['assignedTo', 'status', 'address', 'geometry', 'address_id']
        const safeData = Object.assign({}, _.pick(data, allowUpdateFields), { id, jurisdictionId });
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

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
        const { ServiceRequest, ServiceRequestComment } = databaseEngine.models;
        const params = { where: { jurisdictionId, id }, include: [{ model: ServiceRequestComment, as: 'comments' }], };
        const record = await ServiceRequest.findOne(params);
        return requestWithout311(record);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
        const { ServiceRequest } = databaseEngine.models;
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const records = await ServiceRequest.findAll(params);
        return [records.map(requestWithout311), records.length];
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    async findStatusList(jurisdictionId: string): Promise<Record<string, string>> {
        return Promise.resolve(REQUEST_STATUSES);
    }
    /* eslint-enable @typescript-eslint/no-unused-vars */
    async createComment(jurisdictionId: string, serviceRequestId: string, data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequestComment } = databaseEngine.models;
        const record = await ServiceRequestComment.create(Object.assign({}, data, { serviceRequestId }));
        return record;
    }

    async updateComment(jurisdictionId: string, serviceRequestId: string, serviceRequestCommentId: string, data: Record<string, unknown>): Promise<QueryResult> {
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
