import { inject, injectable } from 'inversify';
import { appIds } from '../../registry/service-identifiers';
import { AppConfig, IStaffUserService, Repositories, StaffUserAttributes, StaffUserDepartmentAttributes, StaffUserStateChangeErrorResponse } from '../../types';

@injectable()
export class StaffUserService implements IStaffUserService {

    repositories: Repositories
    settings: AppConfig

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppConfig) settings: AppConfig,) {
        this.repositories = repositories;
        this.settings = settings;
    }

    async assignDepartment(
        jurisdictionId: string, staffUserId: string, departmentId: string, isLead: boolean
    ): Promise<StaffUserAttributes | null> {
        const { staffUserRepository } = this.repositories;
        const staffUser = await staffUserRepository.findOne(jurisdictionId, staffUserId);
        const verified = staffUser?.jurisdictionId === jurisdictionId;
        let record = null;
        if (verified) {
            record = await staffUserRepository.assignDepartment(jurisdictionId, staffUserId, departmentId, isLead);
        }
        return record;
    }

    async removeDepartment(
        jurisdictionId: string, staffUserId: string, departmentId: string
    ): Promise<StaffUserAttributes | StaffUserStateChangeErrorResponse | null> {
        const { staffUserRepository } = this.repositories;
        const staffUser = await staffUserRepository.findOne(jurisdictionId, staffUserId);
        const verified = staffUser?.jurisdictionId === jurisdictionId;
        let record = null;
        if (verified) {
            record = await staffUserRepository.removeDepartment(jurisdictionId, staffUserId, departmentId);
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
        const { staffUserRepository } = this.repositories;
        return await staffUserRepository.getDepartmentMap(jurisdictionId);
    }

}
