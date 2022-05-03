import { inject, injectable } from 'inversify';
import { appIds } from '../../registry/service-identifiers';
import { AppSettings, IStaffUserService, Repositories, StaffUserAttributes, StaffUserDepartmentAttributes } from '../../types';

@injectable()
export class StaffUserService implements IStaffUserService {

    repositories: Repositories
    settings: AppSettings

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppSettings) settings: AppSettings,) {
        this.repositories = repositories;
        this.settings = settings;
    }

    async assignDepartment(
        jurisdictionId: string, staffUserId: string, departmentId: string, isLead: boolean
    ): Promise<StaffUserAttributes | null> {
        const { Jurisdiction, StaffUser } = this.repositories;
        const verified = await Jurisdiction.hasStaffUser(jurisdictionId, staffUserId);
        let record = null;
        if (verified) {
            record = await StaffUser.assignDepartment(jurisdictionId, staffUserId, departmentId, isLead);
        }
        return record;
    }

    async removeDepartment(
        jurisdictionId: string, staffUserId: string, departmentId: string
    ): Promise<StaffUserAttributes | null> {
        const { Jurisdiction, StaffUser } = this.repositories;
        const verified = await Jurisdiction.hasStaffUser(jurisdictionId, staffUserId);
        let record = null;
        if (verified) {
            record = await StaffUser.removeDepartment(jurisdictionId, staffUserId, departmentId)
        }
        return record;
    }

    async getDepartmentMap(jurisdictionId: string):
        Promise<StaffUserDepartmentAttributes[] | null> {
        const { StaffUser } = this.repositories;
        return await StaffUser.getDepartmentMap(jurisdictionId);
    }

}
