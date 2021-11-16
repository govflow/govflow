import merge from 'deepmerge';
import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { queryParamsToSequelize } from '../../helpers';
import { IStaffUserRepository, IterableQueryResult, QueryParamsAll, QueryResult } from '../../types';

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

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[IterableQueryResult, number]> {
        const { StaffUser } = databaseEngine.models;
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const records = await StaffUser.findAll(params);
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        return [records, records.length];
        /* eslint-enable @typescript-eslint/ban-ts-comment */
    }

    async lookupTable(jurisdictionId: string): Promise<[IterableQueryResult, number]> {
        const queryParams = {
            // TODO: check why not working.
            // selectFields: ['email', 'displayName']
        };
        const [records, count] = await this.findAll(jurisdictionId, queryParams);
        return [
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            records.map((record) => { return { email: record.email, displayName: record.displayName } }),
            /* eslint-enable @typescript-eslint/ban-ts-comment */
            count
        ];
    }

}
