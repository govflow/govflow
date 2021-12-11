import merge from 'deepmerge';
import { injectable } from 'inversify';
import _ from 'lodash';
import sequelize from 'sequelize';
import { queryParamsToSequelize } from '../../helpers';
import type { IServiceRequestRepository, IterableQueryResult, QueryParamsAll, QueryResult } from '../../types';
import { GovFlowEmitter } from '../event-listeners';
import { REQUEST_STATUSES } from './models';

@injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        //@ts-ignore
        const { Communication } = this.dependencies;
        /* eslint-enable */
        const record = await ServiceRequest.create(data);
        GovFlowEmitter.emit('serviceRequestCreate', record, Communication);
        return record;
    }

    async update(jurisdictionId: string, id: string, data: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const { ServiceRequest } = this.models;
        //@ts-ignore
        const { Communication } = this.dependencies;
        const allowUpdateFields = ['assignedTo', 'status', 'address', 'geometry', 'address_id']
        const safeData = Object.assign({}, _.pick(data, allowUpdateFields), { id, jurisdictionId });
        let record = await ServiceRequest.findByPk(id);
        const oldValues = _.pick(record, allowUpdateFields);
        for (const [key, value] of Object.entries(safeData)) {
            // @ts-ignore
            record[key] = value;
        }
        // @ts-ignore

        /* eslint-enable @typescript-eslint/ban-ts-comment */
        record = await record.save();
        GovFlowEmitter.emit('serviceRequestChange', record, { oldValues }, Communication);
        return record;
    }

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        const { ServiceRequest, ServiceRequestComment } = this.models;
        const params = { where: { jurisdictionId, id }, include: [{ model: ServiceRequestComment, as: 'comments' }], };
        const record = await ServiceRequest.findOne(params);
        return record;
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        const params = merge(
            queryParamsToSequelize(queryParams), { where: { jurisdictionId }, order: [['createdAt', 'DESC']] }
        );
        const records = await ServiceRequest.findAll(params);
        return [records, records.length];
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async getStats(
        jurisdictionId: string,
        queryParams?: QueryParamsAll
    ): Promise<Record<string, Record<string, number>>> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        params.attributes = ['status', [sequelize.fn('COUNT', 'id'), 'count']];
        params.group = ['status'];
        const records = await ServiceRequest.findAll(params);
        // @ts-ignore
        const recordsAsData = records.map((record) => { return record.get() })
        const countByStatus: Record<string, number> = recordsAsData.reduce(
            (agg: Record<string, number>, item: { status: string, count: string }) => (
                { ...agg, [item.status]: parseInt(item.count, 10) }
            ),
            {},
        );
        return { countByStatus };
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
        //@ts-ignore
        const { Communication } = this.dependencies;
        // @ts-ignore
        let record = await ServiceRequest.findByPk(id);
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        const oldStatus = record.status;
        record.status = status;
        record = await record.save();
        GovFlowEmitter.emit('serviceRequestChange', record, { status: oldStatus }, Communication);
        return record;
    }

    async updateAssignedTo(jurisdictionId: string, id: string, assignedTo: string): Promise<QueryResult> {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        //@ts-ignore
        const { Communication } = this.dependencies;
        // @ts-ignore
        let record = await ServiceRequest.findByPk(id);
        const oldAssignedTo = record.assignedTo;
        record.assignedTo = assignedTo;
        record = await record.save();
        GovFlowEmitter.emit('serviceRequestChange', record, { assignedTo: oldAssignedTo }, Communication);
        return record;
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

}
