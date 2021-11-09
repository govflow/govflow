import { injectable } from 'inversify';
import _ from 'lodash';
import { databaseEngine } from '../../db';
import { IOpen311ServiceRepository, IOpen311ServiceRequestRepository, IterableQueryResult, QueryResult } from '../../types';
import { serviceAs311 } from '../open311/helpers';

@injectable()
export class Open311ServiceRepository implements IOpen311ServiceRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { Service, Client } = databaseEngine.models;
        const { jurisdictionId, group } = data;
        // take group to create parent, but dont save with group.
        delete data.group;
        // take jurisdictionId to get client, but dont save with service as currently client === jurisdiction.
        delete data.jurisdictionId;
        const client = await Client.findOne({ where: { jurisdictionId }, raw: true });
        if (!_.isNil(data.group)) {
            // @ts-ignore
            const [parent, created] = await Service.findOrCreate({ where: { name: group, id: group, clientId: client.id }, raw: true });
            // @ts-ignore
            data.parentId = parent.id
        }
        const record = await Service.create(data);
        return serviceAs311(record);
    }

    async findOne(jurisdictionId: string, code: string): Promise<QueryResult> {
        const { Service, Client } = databaseEngine.models;
        const client = await Client.findOne({ where: { jurisdictionId }, raw: true });
        // @ts-ignore
        const params = { where: { clientId: client.id, id: code }, raw: true, }
        const record = await Service.findOne(params);
        // @ts-ignore
        return serviceAs311(record);
    }

    async findAll(jurisdictionId: string, whereParams: Record<string, unknown> = {}): Promise<[IterableQueryResult, number]> {
        const { Service, Client } = databaseEngine.models;
        const client = await Client.findOne({ where: { jurisdictionId }, raw: true });
        // @ts-ignore
        const mergedWhere = Object.assign({}, whereParams, { clientId: client.id }) // { parentId: { [Op.not]: null }}
        const records = await Service.findAll({ where: mergedWhere, raw: true });
        return [records.map(serviceAs311), records.length];
    }

}

@injectable()
export class Open311ServiceRequestRepository implements IOpen311ServiceRequestRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { ServiceRequest, Client } = databaseEngine.models;
        const { jurisdictionId } = data;
        // take jurisdictionId to get client, but dont save with service as currently client === jurisdiction.
        delete data.jurisdictionId;
        const client = await Client.findOne({ where: { jurisdictionId }, raw: true });
        // @ts-ignore
        return await ServiceRequest.create(Object.assign({}, data, { clientId: client.id }));
    }

    async findOne(clientId: string, id: string): Promise<QueryResult> {
        const { ServiceRequest } = databaseEngine.models;
        const params = { where: { clientId, id }, raw: true, nest: true };
        return await ServiceRequest.findOne(params);
    }

    async findAll(clientId: string, where: Record<any, unknown> = {}): Promise<[IterableQueryResult, number]> {
        const { ServiceRequest } = databaseEngine.models;
        const params = { where: Object.assign({}, where, { clientId }), raw: true, nest: true };
        const records = await ServiceRequest.findAll(params);
        return [records, records.length];
    }

}
