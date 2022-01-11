import { inject, injectable } from 'inversify';
import { appIds } from '../../registry/service-identifiers';
import {
    AppSettings,
    IOpen311ServiceRepository,
    IOpen311ServiceRequestRepository,
    Models,
    QueryParamsAll,
    ServiceInstance,
    ServiceRequestAttributes,
    ServiceRequestInstance
} from '../../types';
import { toGovflowServiceRequest, toOpen311Service, toOpen311ServiceRequest } from './helpers';
import { Open311Service, Open311ServiceRequest, Open311ServiceRequestCreatePayload } from './types';

@injectable()
export class Open311ServiceRepository implements IOpen311ServiceRepository {

    models: Models;
    settings: AppSettings;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppSettings) settings: AppSettings,
    ) {
        this.models = models;
        this.settings = settings
    }

    async findOne(jurisdictionId: string, code: string): Promise<Open311Service> {
        const { Service } = this.models;
        const params = { where: { jurisdictionId, id: code } }
        const record = await Service.findOne(params) as ServiceInstance;
        return toOpen311Service(record);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<Open311Service[]> {
        const { Service } = this.models;
        const mergedWhere = Object.assign({}, queryParams?.whereParams, { jurisdictionId });
        const records = await Service.findAll({ where: mergedWhere }) as ServiceInstance[];
        return records.map(toOpen311Service);
    }
}

@injectable()
export class Open311ServiceRequestRepository implements IOpen311ServiceRequestRepository {

    models: Models;
    settings: AppSettings;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppSettings) settings: AppSettings,
    ) {
        this.models = models;
        this.settings = settings
    }

    async create(data: Record<string, unknown>): Promise<ServiceRequestInstance> {
        const { ServiceRequest } = this.models;
        const govflowServiceRequest = toGovflowServiceRequest(data as unknown as Open311ServiceRequestCreatePayload);
        const record = await ServiceRequest.create(govflowServiceRequest) as ServiceRequestInstance;
        return record;
    }

    async findOne(jurisdictionId: string, id: string): Promise<Open311ServiceRequest> {
        const { ServiceRequest } = this.models;
        const params = { where: { jurisdictionId, id } };
        const record = await ServiceRequest.findOne(params) as ServiceRequestInstance;
        return toOpen311ServiceRequest(record);
    }

    // async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[Open311ServiceRequest[], number]> {
    //     const { ServiceRequest } = this.models;
    //     const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
    //     const records = await ServiceRequest.findAll(params);
    //     return [records.map(toOpen311ServiceRequest), records.length];
    // }

}
