import { injectable } from 'inversify';
import _ from 'lodash';
import { databaseEngine } from '../../db';
import { IOpen311ServiceRepository, IOpen311ServiceRequestRepository, IterableQueryResult, QueryResult } from '../../types';
import { requestAs311, serviceAs311 } from '../open311/helpers';

@injectable()
export class Open311ServiceRepository implements IOpen311ServiceRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { Service, Jurisdiction } = databaseEngine.models;
        const { jurisdictionId, group } = data;
        // take group to create parent, but dont save with group.
        delete data.group;
        delete data.jurisdictionId;
        const jurisdiction = await Jurisdiction.findOne({ where: { id: jurisdictionId } });
        if (!_.isNil(data.group)) {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            /* eslint-disable @typescript-eslint/no-unused-vars */
            // @ts-ignore
            const [parent, created] = await Service.findOrCreate({ where: { name: group, id: group, jurisdictionId: jurisdiction.id } });
            /* eslint-enable @typescript-eslint/no-unused-vars */
            // @ts-ignore
            data.parentId = parent.id
            /* eslint-enable @typescript-eslint/ban-ts-comment */
        }
        const record = await Service.create(data);
        return serviceAs311(record);
    }

    async findOne(jurisdictionId: string, code: string): Promise<QueryResult> {
        const { Service } = databaseEngine.models;
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const params = { where: { jurisdictionId, id: code } }
        const record = await Service.findOne(params);
        // @ts-ignore
        return serviceAs311(record);
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async findAll(jurisdictionId: string, whereParams: Record<string, unknown> = {}): Promise<[IterableQueryResult, number]> {
        const { Service } = databaseEngine.models;
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const mergedWhere = Object.assign({}, whereParams, { jurisdictionId }) // { parentId: { [Op.not]: null }}
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        const records = await Service.findAll({ where: mergedWhere });
        return [records.map(serviceAs311), records.length];
    }

}

@injectable()
export class Open311ServiceRequestRepository implements IOpen311ServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequest, Jurisdiction } = databaseEngine.models;
        const { jurisdictionId } = data;
        delete data.jurisdictionId;
        const jurisdiction = await Jurisdiction.findOne({ where: { jurisdictionId } });
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const record = await ServiceRequest.create(Object.assign({}, data, { jurisdictionId: jurisdiction.id }));
        return requestAs311(record);
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
        const { ServiceRequest } = databaseEngine.models;
        const params = { where: { jurisdictionId, id } };
        const record = await ServiceRequest.findOne(params);
        return requestAs311(record);
    }

    async findAll(jurisdictionId: string, where: Record<string, unknown> = {}): Promise<[IterableQueryResult, number]> {
        const { ServiceRequest } = databaseEngine.models;
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        const params = { where: Object.assign({}, where, { jurisdictionId }) };
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        const records = await ServiceRequest.findAll(params);
        return [records.map(requestAs311), records.length];
    }

}
