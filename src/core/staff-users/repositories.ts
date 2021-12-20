import merge from 'deepmerge';
import { injectable } from 'inversify';
import { queryParamsToSequelize } from '../../helpers';
import { IStaffUserRepository, QueryParamsAll, StaffUserAttributes, StaffUserLookUpAttributes } from '../../types';

@injectable()
export class StaffUserRepository implements IStaffUserRepository {

    async create(data: StaffUserAttributes): Promise<StaffUserAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.models;
        /* eslint-enable */
        const params = data;
        return await StaffUser.create(params);
    }

    async findOne(jurisdictionId: string, id: string): Promise<StaffUserAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.models;
        /* eslint-enable */
        const params = { where: { jurisdictionId, id } };
        return await StaffUser.findOne(params);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[StaffUserAttributes[], number]> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.models;
        /* eslint-enable */
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const records = await StaffUser.findAll(params);
        return [records, records.length];
    }

    async lookupTable(jurisdictionId: string): Promise<[StaffUserLookUpAttributes[], number]> {
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
