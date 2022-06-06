import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { appIds } from '../../registry/service-identifiers';
import { AppConfig, AuditedStateChangeExtraData, auditMessageFields, IServiceRequestService, Repositories, ServiceRequestAttributes, ServiceRequestStateChangeErrorResponse } from '../../types';
import { makeAuditMessage } from './helpers';
import { REQUEST_STATUSES } from './models';

@injectable()
export class ServiceRequestService implements IServiceRequestService {

    repositories: Repositories
    config: AppConfig

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppConfig) config: AppConfig,) {
        this.repositories = repositories;
        this.config = config;
    }

    async createAuditedStateChange(
        jurisdictionId: string,
        id: string,
        key: string,
        value: string,
        extraData?: AuditedStateChangeExtraData
    ):
        Promise<ServiceRequestAttributes | ServiceRequestStateChangeErrorResponse> {
        const {
            jurisdictionRepository,
            serviceRequestRepository,
            staffUserRepository,
            departmentRepository,
            serviceRepository
        } = this.repositories;
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
        let record = await serviceRequestRepository.findOne(jurisdictionId, id);
        let oldDepartmentValue = null;
        const updateData = {} as Partial<ServiceRequestAttributes>;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        updateData[key] = value;

        // TODO: this if statement is the first occurance we have of customized business
        // logic around a request state change, therefore I just inlined it.
        // However, as we get more cases, we probably want to extract this into
        // a function that runs a series of tests, based on the current config for the jurisdiction,
        // and returns true or false
        if (key === 'assignedTo' && jurisdiction.enforceAssignmentThroughDepartment) {
            const departmentId = extraData?.departmentId;
            let allowedAction = false;

            if (departmentId) {
                if (!value) {
                    // we have no assignee so we do not need to check dept / assigneee relationship
                    allowedAction = true;
                } else {
                    const proposedAssignee = await staffUserRepository.findOne(jurisdictionId, value);
                    if (proposedAssignee) {
                        const proposedAssigneeDepartments = _.map(
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            proposedAssignee.departments,
                            (sud) => { return sud.departmentId }
                        );
                        allowedAction = proposedAssigneeDepartments.includes(departmentId);
                    }
                }
                updateData.departmentId = departmentId;
                oldDepartmentValue = record.departmentId;
            }

            if (!allowedAction) {
                return {
                    isError: true,
                    message: 'Cannot update Service Request assignee without a valid Department'
                } as ServiceRequestStateChangeErrorResponse
            }

        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const oldValue = record[key];
        let oldDisplayValue = oldValue;
        const auditMessageFields: auditMessageFields[] = [];
        let newDisplayValue = value;
        let fieldName = key;

        // save the change on the record
        record = await serviceRequestRepository.update(jurisdictionId, id, updateData);

        // create the audit record / message
        if (key === 'status') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            newDisplayValue = REQUEST_STATUSES[value];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            oldDisplayValue = REQUEST_STATUSES[oldValue];
            fieldName = 'Status';
            auditMessageFields.push({ fieldName, oldValue: oldDisplayValue, newValue: newDisplayValue });
        } else if (key === 'assignedTo') {
            if (value) {
                const newAssignee = await staffUserRepository.findOne(jurisdictionId, value);
                const oldAssignee = await staffUserRepository.findOne(jurisdictionId, oldValue);
                if (newAssignee) { newDisplayValue = newAssignee.displayName }
                if (oldAssignee) { oldDisplayValue = oldAssignee.displayName } else { oldDisplayValue = 'No Assignee' }
            } else {
                newDisplayValue = 'Unassigned';
            }
            fieldName = 'Assignee';
            auditMessageFields.push({ fieldName, oldValue: oldDisplayValue, newValue: newDisplayValue });
            if (extraData?.departmentId) {
                const departmentFieldName = 'Department';
                let newDepartmentDisplayValue = '';
                let oldDepartmentDisplayValue = '';
                let oldDepartment;
                const newDepartment = await departmentRepository.findOne(jurisdictionId, extraData.departmentId);
                if (oldDepartmentValue) {
                    oldDepartment = await departmentRepository.findOne(jurisdictionId, oldDepartmentValue as string);
                }
                if (newDepartment) {
                    newDepartmentDisplayValue = newDepartment.name
                } else {
                    newDepartmentDisplayValue = 'No Department'
                }
                if (oldDepartment) {
                    oldDepartmentDisplayValue = oldDepartment.name
                } else {
                    oldDepartmentDisplayValue = 'No Department'
                }
                if (newDepartment) {
                    auditMessageFields.push({
                        fieldName: departmentFieldName,
                        oldValue: oldDepartmentDisplayValue,
                        newValue: newDepartmentDisplayValue
                    });
                }
            }
        } else if (key === 'departmentId') {
            if (value) {
                const newDepartment = await departmentRepository.findOne(jurisdictionId, value);
                const oldDepartment = await departmentRepository.findOne(jurisdictionId, oldValue);
                if (newDepartment) { newDisplayValue = newDepartment.name }
                if (oldDepartment) { oldDisplayValue = oldDepartment.name } else { oldDisplayValue = 'No Department' }
            } else {
                newDisplayValue = 'No Department';
            }
            fieldName = 'Department';
        } else if (key === 'serviceId') {
            if (value) {
                const newService = await serviceRepository.findOne(jurisdictionId, value);
                const oldService = await serviceRepository.findOne(jurisdictionId, oldValue);
                if (newService) { newDisplayValue = newService.name }
                if (oldService) { oldDisplayValue = oldService.name } else { oldDisplayValue = 'No Service' }
            } else {
                newDisplayValue = 'No Service';
            }
            fieldName = 'Service';
        }
        const auditMessage = makeAuditMessage(extraData?.user, auditMessageFields);
        await serviceRequestRepository.createComment(
            jurisdictionId, record.id, { comment: auditMessage, addedBy: extraData?.user?.id }
        );
        return record;
    }

}
