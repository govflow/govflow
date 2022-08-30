import { inject, injectable } from 'inversify';
import { appIds } from '../../registry/service-identifiers';
import { AppConfig, IServiceRequestHookRunner, IStaffUserService, Repositories, StaffUserAttributes, StaffUserDepartmentAttributes } from '../../types';

@injectable()
export class StaffUserService implements IStaffUserService {

    repositories: Repositories
    config: AppConfig
    hookRunner: IServiceRequestHookRunner;

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppConfig) config: AppConfig,
        @inject(appIds.ServiceRequestHookRunner) hookRunner: IServiceRequestHookRunner,
    ) {
        this.repositories = repositories;
        this.config = config;
        this.hookRunner = hookRunner
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
    ): Promise<StaffUserAttributes | null> {
        const { staffUserRepository } = this.repositories;
        const staffUser = await staffUserRepository.findOne(jurisdictionId, staffUserId);
        const verified = staffUser?.jurisdictionId === jurisdictionId;
        let record = null;
        if (verified) {
            record = await staffUserRepository.removeDepartment(jurisdictionId, staffUserId, departmentId);
        }
        return record;
    }

    async getDepartmentMap(jurisdictionId: string):
        Promise<StaffUserDepartmentAttributes[] | null> {
        const { staffUserRepository } = this.repositories;
        return await staffUserRepository.getDepartmentMap(jurisdictionId);
    }

}
