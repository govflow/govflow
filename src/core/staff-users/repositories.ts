import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IStaffUserRepository, IterableQueryResult, QueryResult } from '../../types';

@injectable()
export class StaffUserRepository implements IStaffUserRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { StaffUser } = databaseEngine.models;
        const params = data;
        return await StaffUser.create(params);
    }

    async findOne(jurisdictionId: string, id: string): Promise<QueryResult> {
        const { StaffUser } = databaseEngine.models;
        const params = { where: { jurisdictionId, id } };
        return await StaffUser.findOne(params);
    }

    async findAll(jurisdictionId: string): Promise<[IterableQueryResult, number]> {
        const { StaffUser } = databaseEngine.models;
        const params = { where: { jurisdictionId } };
        const records = await StaffUser.findAll(params);
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        return [records, records.length];
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

}
