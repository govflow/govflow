import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IClientRepository, IStaffUserRepository, IterableQueryResult, QueryResult } from '../../types';

@injectable()
export class ClientRepository implements IClientRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { Client } = databaseEngine.models;
        const params = data;
        return await Client.create(params);
    }

    async findOne(id: string): Promise<QueryResult> {
        const { Client } = databaseEngine.models;
        const params = { where: { id }, raw: true, nest: true };
        return await Client.findOne(params);
    }

    async findOneByJurisdiction(jurisdictionId: string): Promise<QueryResult> {
        const { Client } = databaseEngine.models;
        const params = { where: { jurisdictionId }, raw: true, nest: true };
        return await Client.findOne(params);
    }

}


@injectable()
export class StaffUserRepository implements IStaffUserRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { StaffUser } = databaseEngine.models;
        const params = data;
        return await StaffUser.create(params);
    }

    async findOne(clientId: string, id: string): Promise<QueryResult> {
        const { StaffUser } = databaseEngine.models;
        const params = { where: { clientId, id } };
        return await StaffUser.findOne(params);
    }

    async findAll(clientId: string): Promise<[IterableQueryResult, number]> {
        const { StaffUser } = databaseEngine.models;
        const params = { where: { clientId } };
        const records = await StaffUser.findAll(params);
        // @ts-ignore
        return [records, records.length];
    }

}
