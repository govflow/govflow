import { inject, injectable } from 'inversify';
import { appIds } from '../../registry/service-identifiers';
import { AppSettings, IStaffUserService, Repositories, StaffUserAttributes, StaffUserDepartmentAttributes, StaffUserStateChangeErrorResponse } from '../../types';

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
        const { StaffUser } = this.repositories;
        const staffUser = await StaffUser.findOne(jurisdictionId, staffUserId);
        const verified = staffUser?.jurisdictionId === jurisdictionId;
        let record = null;
        if (verified) {
            record = await StaffUser.assignDepartment(jurisdictionId, staffUserId, departmentId, isLead);
        }
        return record;
    }

    async removeDepartment(
        jurisdictionId: string, staffUserId: string, departmentId: string
    ): Promise<StaffUserAttributes | StaffUserStateChangeErrorResponse | null> {
        const { StaffUser } = this.repositories;
        const staffUser = await StaffUser.findOne(jurisdictionId, staffUserId);
        const verified = staffUser?.jurisdictionId === jurisdictionId;
        let record = null;
        if (verified) {
            record = await StaffUser.removeDepartment(jurisdictionId, staffUserId, departmentId);
            if (!record) {
                return {
                    isError: true,
                    message: 'Invalid action. Ensure another Staff User is Department lead first.'
                } as StaffUserStateChangeErrorResponse
            }
        }

        return record;
    }

    async getDepartmentMap(jurisdictionId: string):
        Promise<StaffUserDepartmentAttributes[] | null> {
        const { StaffUser } = this.repositories;
        return await StaffUser.getDepartmentMap(jurisdictionId);
    }

}
