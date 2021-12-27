import merge from 'deepmerge';
import { inject, injectable } from 'inversify';
import { queryParamsToSequelize } from '../../helpers';
import { appIds } from '../../registry/service-identifiers';
import { AppSettings, IStaffUserRepository, Models, QueryParamsAll, StaffUserAttributes, StaffUserInstance, StaffUserLookUpAttributes } from '../../types';

@injectable()
export class StaffUserRepository implements IStaffUserRepository {

    models: Models;
    settings: AppSettings;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppSettings) settings: AppSettings,
    ) {
        this.models = models;
        this.settings = settings
    }

    async create(data: StaffUserAttributes): Promise<StaffUserAttributes> {
        const { StaffUser } = this.models;
        const params = data;
        return await StaffUser.create(params) as StaffUserInstance;
    }

    async findOne(jurisdictionId: string, id: string): Promise<StaffUserAttributes> {
        const { StaffUser } = this.models;
        const params = { where: { jurisdictionId, id } };
        return await StaffUser.findOne(params) as StaffUserInstance;
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[StaffUserAttributes[], number]> {
        const { StaffUser } = this.models;
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const records = await StaffUser.findAll(params);
        return [records as StaffUserInstance[], records.length];
    }

    async lookupTable(jurisdictionId: string): Promise<[StaffUserLookUpAttributes[], number]> {
        const queryParams = {
            // TODO: check why not working.
            // selectFields: ['email', 'displayName']
        };
        const [records, count] = await this.findAll(jurisdictionId, queryParams);
        return [
            records.map(
                (record) => {
                    return { email: record.email, displayName: record.displayName }
                }
            ) as StaffUserLookUpAttributes[],
            count
        ];
    }

}
