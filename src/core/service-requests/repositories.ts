import merge from 'deepmerge';
import { inject, injectable } from 'inversify';
import _ from 'lodash';
import sequelize, { Op } from 'sequelize';
import { queryParamsToSequelize } from '../../helpers';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppConfig,
    InboundMapInstance,
    IServiceRequestRepository,
    Models,
    QueryParamsAll,
    ServiceRequestAttributes,
    ServiceRequestCommentAttributes,
    ServiceRequestCommentCreateAttributes,
    ServiceRequestCommentInstance,
    ServiceRequestCreateAttributes,
    ServiceRequestInstance,
    ServiceRequestStatusAttributes
} from '../../types';
import { REQUEST_STATUSES, SERVICE_REQUEST_CLOSED_STATES } from './models';


@injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config;
    }

    async create(data: ServiceRequestCreateAttributes): Promise<ServiceRequestAttributes> {
        const { ServiceRequest, ServiceRequestComment, InboundMap } = this.models;
        // need to do this because sequelize cant return existing associations on a create,
        // in the case where the associations are not being created
        const createdRecord = await ServiceRequest.create(data) as ServiceRequestInstance;
        const record = await ServiceRequest.findByPk(
            createdRecord.id,
            {
                include: [
                    { model: ServiceRequestComment, as: 'comments' },
                    { model: InboundMap, as: 'inboundMaps' }
                ]
            }
        ) as ServiceRequestInstance;
        // ensure we have an inbound routing email
        await InboundMap.create({
            id: record.id.replaceAll('-', ''),
            jurisdictionId: record.jurisdictionId,
            serviceRequestId: record.id
        }) as InboundMapInstance;
        // re-querying to get all properties that are set in `findOne`
        return await this.findOne(record.jurisdictionId, record.id);
    }

    async update(jurisdictionId: string, id: string, data: Partial<ServiceRequestAttributes>):
        Promise<ServiceRequestAttributes> {
        const { ServiceRequest } = this.models;
        const allowUpdateFields = [
            'assignedTo', 'serviceId', 'departmentId', 'status', 'address', 'geometry', 'address_id'
        ]
        const safeData = Object.assign({}, _.pick(data, allowUpdateFields), { id, jurisdictionId });
        let record = await ServiceRequest.findByPk(id) as ServiceRequestInstance;
        for (const [key, value] of Object.entries(safeData)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            record[key] = value;
        }
        record = await record.save();
        // re-querying to get all properties that are set in `findOne`
        return await this.findOne(record.jurisdictionId, record.id);
    }

    async findOne(jurisdictionId: string, id: string): Promise<ServiceRequestAttributes> {
        const { ServiceRequest, ServiceRequestComment, InboundMap } = this.models;
        const params = {
            where: { jurisdictionId, id },
            include: [
                { model: ServiceRequestComment, as: 'comments' },
                { model: InboundMap, as: 'inboundMaps' }
            ],
            order: [
                [{ model: ServiceRequestComment, as: 'comments' }, 'createdAt', 'ASC']
            ]
        };
        // sequelize v6 typescript does not like the order clause
        // even though it is valid so, need to ts-ignore
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const record = await ServiceRequest.findOne(params) as ServiceRequestInstance;
        return record;
    }

    async findOneByPublicId(jurisdictionId: string, publicId: string): Promise<ServiceRequestAttributes> {
        const { ServiceRequest, ServiceRequestComment, InboundMap } = this.models;
        const params = {
            where: { jurisdictionId, publicId },
            include: [
                { model: ServiceRequestComment, as: 'comments' },
                { model: InboundMap, as: 'inboundMaps' }
            ],
            order: [
                [{ model: ServiceRequestComment, as: 'comments' }, 'createdAt', 'ASC']
            ]
        };
        // sequelize v6 typescript does not like the order clause
        // even though it is valid so, need to ts-ignore
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const record = await ServiceRequest.findOne(params) as ServiceRequestInstance;
        return record;
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[ServiceRequestAttributes[], number]> {
        const { ServiceRequest } = this.models;
        const params = merge(
            queryParamsToSequelize(queryParams), { where: { jurisdictionId }, order: [['createdAt', 'DESC']] }
        );
        const records = await ServiceRequest.findAll(params) as ServiceRequestInstance[];
        return [records, records.length];
    }

    async findAllForSubmitter(
        jurisdictionId: string, channel: string, submitterId: string
    ): Promise<[ServiceRequestAttributes[], number]> {
        const { ServiceRequest } = this.models;
        // TODO: support channel to get the submitterId from email or phone fields
        // currently, we know it is a phone based on the usage of this method
        // only for disambiguation of inbound sms data

        const params = {
            where: {
                jurisdictionId,
                channel,
                phone: submitterId,
                status: { [Op.notIn]: SERVICE_REQUEST_CLOSED_STATES }
            }
        };
        const records = await ServiceRequest.findAll(params) as ServiceRequestInstance[];
        return [records, records.length];
    }

    async getStats(
        jurisdictionId: string,
        queryParams?: QueryParamsAll
    ): Promise<Record<string, Record<string, number>>> {
        const { ServiceRequest } = this.models;
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        params.attributes = ['status', [sequelize.fn('COUNT', 'id'), 'count']];
        params.group = ['status'];
        const records = await ServiceRequest.findAll(params);
        const recordsAsData = records.map((record) => { return record.get() })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const countByStatus: Record<string, number> = recordsAsData.reduce(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (agg: Record<string, number>, item: { status: string, count: string }) => (
                { ...agg, [item.status]: parseInt(item.count, 10) }
            ),
            {},
        );
        return { countByStatus };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async findStatusList(jurisdictionId: string): Promise<ServiceRequestStatusAttributes[]> {
        const serviceRequestStatusList: ServiceRequestStatusAttributes[] = [];
        for (const [key, value] of Object.entries(REQUEST_STATUSES)) {
            const isClosed = SERVICE_REQUEST_CLOSED_STATES.includes(key);
            let label = value;
            if (isClosed) { label = `${value} [Closed]` }
            serviceRequestStatusList.push({ id: key, label, isClosed })
        }
        return Promise.resolve(serviceRequestStatusList);
    }

    async createComment(
        jurisdictionId: string,
        serviceRequestId: string,
        data: ServiceRequestCommentCreateAttributes,
    ): Promise<ServiceRequestCommentAttributes> {
        const { ServiceRequestComment } = this.models;
        const record = await ServiceRequestComment.create(
            Object.assign({}, data, { serviceRequestId })
        ) as ServiceRequestCommentInstance;
        return record;
    }

    async updateComment(
        jurisdictionId: string,
        serviceRequestId: string,
        serviceRequestCommentId: string,
        data: Partial<ServiceRequestCommentAttributes>
    ): Promise<ServiceRequestCommentAttributes> {

        const { ServiceRequestComment } = this.models;
        const record = await ServiceRequestComment.findByPk(serviceRequestCommentId) as ServiceRequestCommentInstance;
        for (const [key, value] of Object.entries(data)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            record[key] = value;
        }
        return await record.save();
    }

}
