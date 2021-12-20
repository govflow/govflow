import { injectable } from 'inversify';
import { IOpen311ServiceRepository, IOpen311ServiceRequestRepository, QueryParamsAll } from '../../types';
import { toGovflowServiceRequest, toOpen311Service, toOpen311ServiceRequest } from './helpers';
import { Open311Service, Open311ServiceRequest, Open311ServiceRequestCreatePayload } from './types';

@injectable()
export class Open311ServiceRepository implements IOpen311ServiceRepository {
    async findOne(jurisdictionId: string, code: string): Promise<Open311Service> {
        /* eslint-disable */
        //@ts-ignore
        const { Service } = this.models;
        /* eslint-enable */
        const params = { where: { jurisdictionId, id: code } }
        const record = await Service.findOne(params);
        return toOpen311Service(record);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<Open311Service[]> {
        /* eslint-disable */
        //@ts-ignore
        const { Service } = this.models;
        /* eslint-enable */
        const mergedWhere = Object.assign({}, queryParams?.whereParams, { jurisdictionId });
        const records = await Service.findAll({ where: mergedWhere });
        return [records.map(toOpen311Service), records.length];
    }
}

@injectable()
export class Open311ServiceRequestRepository implements IOpen311ServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<Open311ServiceRequest> {
        /* eslint-disable */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        const govflowServiceRequest = toGovflowServiceRequest(data as unknown as Open311ServiceRequestCreatePayload);
        const record = await ServiceRequest.create(govflowServiceRequest);
        return toOpen311ServiceRequest(record);
    }

    async findOne(jurisdictionId: string, id: string): Promise<Open311ServiceRequest> {
        /* eslint-disable */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        /* eslint-enable */
        const params = { where: { jurisdictionId, id } };
        const record = await ServiceRequest.findOne(params);
        return toOpen311ServiceRequest(record);
    }

    // async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
    //     /* eslint-disable */
    //     //@ts-ignore
    //     const { ServiceRequest } = this.models;
    //     /* eslint-enable */
    //     const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
    //     const records = await ServiceRequest.findAll(params);
    //     return [records.map(toOpen311ServiceRequest), records.length];
    // }

}
