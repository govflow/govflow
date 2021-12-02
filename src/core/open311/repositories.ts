import merge from 'deepmerge';
import { injectable } from 'inversify';
import { queryParamsToSequelize } from '../../helpers';
import { IOpen311ServiceRepository, IOpen311ServiceRequestRepository, IterableQueryResult, QueryParamsAll, QueryResult } from '../../types';
import { requestAs311, serviceAs311 } from '../open311/helpers';

@injectable()
export class Open311ServiceRepository implements IOpen311ServiceRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { Service, Jurisdiction } = this.models;
        /* eslint-enable */
        // take group to create parent, but dont save with group.
        delete data.group;
        delete data.jurisdictionId;
        const record = await Service.create(data);
        return serviceAs311(record);
    }

    async findOne(jurisdictionId: string, code: string): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { Service } = this.models;
        /* eslint-enable */
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const params = { where: { jurisdictionId, id: code } }
        const record = await Service.findOne(params);
        // @ts-ignore
        return serviceAs311(record);
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
        /* eslint-disable */
        //@ts-ignore
        const { Service } = this.models;
        /* eslint-enable */
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const mergedWhere = Object.assign({}, queryParams?.whereParams, { jurisdictionId });
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        const records = await Service.findAll({ where: mergedWhere });
        return [records.map(serviceAs311), records.length];
    }

}

@injectable()
export class Open311ServiceRequestRepository implements IOpen311ServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { ServiceRequest, Jurisdiction } = this.models;
        /* eslint-enable */
        const { jurisdictionId } = data;
        delete data.jurisdictionId;
        const jurisdiction = await Jurisdiction.findOne({ where: { id: jurisdictionId } });
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const record = await ServiceRequest.create(Object.assign({}, data, { jurisdictionId: jurisdiction.id }));
        return requestAs311(record);
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        /* eslint-enable */
        const params = { where: { jurisdictionId, id } };
        const record = await ServiceRequest.findOne(params);
        return requestAs311(record);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
        /* eslint-disable */
        //@ts-ignore
        const { ServiceRequest } = this.models;
        /* eslint-enable */
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const records = await ServiceRequest.findAll(params);
        return [records.map(requestAs311), records.length];
    }

}
