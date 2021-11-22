import merge from 'deepmerge';
import { injectable } from 'inversify';
import _ from 'lodash';
import { queryParamsToSequelize } from '../../helpers';
import type { IServiceRequestRepository, IterableQueryResult, QueryParamsAll, QueryResult } from '../../types';
import { requestWithout311 } from '../open311/helpers';
import { REQUEST_STATUSES } from './models';

@injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        /* eslint-enable */
        const record = await ServiceRequest.create(data);
        return requestWithout311(record);
    }

    async update(jurisdictionId: string, id: string, data: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const { ServiceRequest } = this.models;
        const allowUpdateFields = ['assignedTo', 'status', 'address', 'geometry', 'address_id']
        const safeData = Object.assign({}, _.pick(data, allowUpdateFields), { id, jurisdictionId });
        const record = await ServiceRequest.findByPk(id);
        for (const [key, value] of Object.entries(safeData)) {
            // @ts-ignore
            record[key] = value;
        }
        // @ts-ignore

        /* eslint-enable @typescript-eslint/ban-ts-comment */
        return requestWithout311(await record.save());
    }

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        const { ServiceRequest, ServiceRequestComment } = this.models;
        const params = { where: { jurisdictionId, id }, include: [{ model: ServiceRequestComment, as: 'comments' }], };
        const record = await ServiceRequest.findOne(params);
        return requestWithout311(record);
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const records = await ServiceRequest.findAll(params);
        return [records.map(requestWithout311), records.length];
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    async findStatusList(jurisdictionId: string): Promise<Record<string, string>> {
        return Promise.resolve(REQUEST_STATUSES);

    }
    /* eslint-enable @typescript-eslint/no-unused-vars */

    async createComment(
        jurisdictionId: string,
        serviceRequestId: string,
        data: Record<string, unknown>
    ): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        /* eslint-disable @typescript-eslint/no-unused-vars */
        //@ts-ignore
        const { ServiceRequestComment } = this.models;
        const record = await ServiceRequestComment.create(Object.assign({}, data, { serviceRequestId }));
        return record;
        /* eslint-enable @typescript-eslint/no-unused-vars */
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async updateComment(
        jurisdictionId: string,
        serviceRequestId: string,
        serviceRequestCommentId: string,
        data: Record<string, unknown>
    ): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        const { ServiceRequestComment } = this.models;
        // @ts-ignore
        const record = await ServiceRequestComment.findByPk(serviceRequestCommentId);
        for (const [key, value] of Object.entries(data)) {
            // @ts-ignore
            record[key] = value;
        }
        // @ts-ignore
        return await record.save();
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async updateStatus(jurisdictionId: string, id: string, status: string): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        // @ts-ignore
        const record = await ServiceRequest.findByPk(id);
        record.status = status;
        return await record.save();
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async updateAssignedTo(jurisdictionId: string, id: string, assignedTo: string): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        // @ts-ignore
        const record = await ServiceRequest.findByPk(id);
        record.assignedTo = assignedTo;
        return await record.save();
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

}
