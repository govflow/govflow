import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IStaffUserRepository, IterableQueryResult, QueryResult } from '../../types';

@injectable()
export class StaffUserRepository implements IStaffUserRepository {

    async findOne(id: string, clientId: string): Promise<QueryResult> {
        return await databaseEngine.models.StaffUser.findOne({
            where: { id, clientId },
            raw: true,
        });
    }

    async findAll(clientId: string): Promise<[IterableQueryResult, number]> {
        const records = await databaseEngine.models.StaffUser.findAll({
            where: { clientId },
            raw: true,
        });
        return [records, records.length];
    }

    async create(clientId: string, payload: Record<string, unknown>): Promise<QueryResult> {
        return await databaseEngine.models.StaffUser.create(payload);
    }

}
