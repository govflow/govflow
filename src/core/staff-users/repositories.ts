import merge from 'deepmerge';
import { inject, injectable } from 'inversify';
import { queryParamsToSequelize } from '../../helpers';
import { appIds } from '../../registry/service-identifiers';
import { AppConfig, IStaffUserRepository, Models, QueryParamsAll, StaffUserAttributes, StaffUserDepartmentAttributes, StaffUserDepartmentInstance, StaffUserInstance, StaffUserLookUpAttributes } from '../../types';
import { getDepartmentsForStaffUser } from './helpers';

@injectable()
export class StaffUserRepository implements IStaffUserRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config
    }

    async create(data: StaffUserAttributes): Promise<StaffUserAttributes> {
        const { StaffUser } = this.models;
        const params = data;
        return await StaffUser.create(params) as StaffUserInstance;
    }

    async findOne(jurisdictionId: string, id: string): Promise<StaffUserAttributes | null> {
        const { StaffUser, StaffUserDepartment } = this.models;
        const params = { where: { jurisdictionId, id } };
        let record = null;
        const instance = await StaffUser.findOne(params) as StaffUserInstance;
        if (instance) {
            record = instance.get({ plain: true });
        }
        if (record) {
            record.departments = await getDepartmentsForStaffUser(record, StaffUserDepartment);
        }
        return record;
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[StaffUserAttributes[], number]> {
        const { StaffUser, StaffUserDepartment } = this.models;
        const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
        const instances = await StaffUser.findAll(params) as StaffUserInstance[];
        const records = instances.map(instance => instance.get({ plain: true }));
        for (const record of records) {
            record.departments = await getDepartmentsForStaffUser(record, StaffUserDepartment);
        }
        return [records, records.length];
    }

    async lookupTable(jurisdictionId: string): Promise<[StaffUserLookUpAttributes[], number]> {
        const queryParams = {
            // TODO: check why not working.
            // selectFields: ['id', 'displayName']
        };
        const [records, count] = await this.findAll(jurisdictionId, queryParams);
        return [
            records.map(
                (record) => {
                    return { id: record.id, displayName: record.displayName }
                }
            ) as StaffUserLookUpAttributes[],
            count
        ];
    }

    async getDepartmentMap(jurisdictionId: string): Promise<StaffUserDepartmentAttributes[] | null> {
        const { StaffUserDepartment } = this.models;
        const [staffUsers, _count] = await this.findAll(jurisdictionId);
        const staffUserIds = staffUsers.map(s => s.id);
        return await StaffUserDepartment.findAll(
            { where: { staffUserId: staffUserIds } }
        ) as StaffUserDepartmentInstance[];
    }

    async assignDepartment(
        jurisdictionId: string, staffUserId: string, departmentId: string, isLead: boolean
    ): Promise<StaffUserAttributes | null> {
        const { StaffUserDepartment } = this.models;
        const existingLead = await StaffUserDepartment.findOne({ where: { isLead: true, departmentId } });
        const existingRecord = await StaffUserDepartment.findOne({ where: { staffUserId, departmentId } });
        const reallyIsLead = existingLead ? isLead : true;
        if (existingRecord) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            existingRecord.isLead = reallyIsLead;
            await existingRecord.save()
        } else {
            await StaffUserDepartment.create({ staffUserId, departmentId, isLead: reallyIsLead });
        }
        return await this.findOne(jurisdictionId, staffUserId);
    }

    async removeDepartment(
        jurisdictionId: string, staffUserId: string, departmentId: string)
        : Promise<StaffUserAttributes | null> {
        const { StaffUserDepartment } = this.models;
        const remainingLead = await StaffUserDepartment.findOne({ where: { isLead: true, departmentId } });
        if (!remainingLead) {
            return null;
        } else {
            await StaffUserDepartment.destroy({ where: { staffUserId, departmentId } });
            return await this.findOne(jurisdictionId, staffUserId);
        }
    }

}
