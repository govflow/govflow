import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { appIds } from '../../registry/service-identifiers';
import { AppSettings, AuditedStateChangeExtraData, IServiceRequestService, Repositories, ServiceRequestAttributes, ServiceRequestStateChangeErrorResponse } from '../../types';
import { makeAuditMessage } from './helpers';
import { REQUEST_STATUSES } from './models';

@injectable()
export class ServiceRequestService implements IServiceRequestService {

    repositories: Repositories
    settings: AppSettings

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppSettings) settings: AppSettings,) {
        this.repositories = repositories;
        this.settings = settings;
    }

    async createAuditedStateChange(
        jurisdictionId: string,
        id: string,
        key: string,
        value: string,
        extraData?: AuditedStateChangeExtraData
    ):
        Promise<ServiceRequestAttributes | ServiceRequestStateChangeErrorResponse> {
        const { Jurisdiction, ServiceRequest, StaffUser, Department, Service } = this.repositories;
        const jurisdiction = await Jurisdiction.findOne(jurisdictionId);
        let record = await ServiceRequest.findOne(jurisdictionId, id);

        // TODO: this if statement is the first occurance we have of customized business
        // logic around a request state change, therefore I just inlined it.
        // However, as we get more cases, we probably want to extract this into
        // a function that runs a series of tests, based on the current config for the jurisdiction,
        // and returns true or false
        if (key === 'assignedTo' && jurisdiction.enforceAssignmentThroughDepartment) {
            const departmentId = extraData?.departmentId;
            let allowedAction = false;

            if (departmentId) {
                const proposedAssignee = await StaffUser.findOne(jurisdictionId, value);
                if (proposedAssignee) {
                    const proposedAssigneeDepartments = _.map(
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        proposedAssignee.dataValues.departments,
                        (sud) => { return sud.departmentId }
                    );
                    allowedAction = proposedAssigneeDepartments.includes(departmentId);
                }
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
        const data = {}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data[key] = value;
        let newDisplayValue = value;
        let fieldName = key;

        // save the change on the record
        record = await ServiceRequest.update(jurisdictionId, id, data);

        // create the audit record / message
        if (key === 'status') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            newDisplayValue = REQUEST_STATUSES[value];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            oldDisplayValue = REQUEST_STATUSES[oldValue];
            fieldName = 'Status';
        } else if (key === 'assignedTo') {
            if (value) {
                const newAssignee = await StaffUser.findOne(jurisdictionId, value);
                const oldAssignee = await StaffUser.findOne(jurisdictionId, oldValue);
                if (newAssignee) { newDisplayValue = newAssignee.displayName }
                if (oldAssignee) { oldDisplayValue = oldAssignee.displayName } else { oldDisplayValue = 'No Assignee' }
            } else {
                newDisplayValue = 'Unassigned';
            }
            fieldName = 'Assignee';
        } else if (key === 'departmentId') {
            console.log("HERE")
            if (value) {
                const newDepartment = await Department.findOne(jurisdictionId, value);
                const oldDepartment = await Department.findOne(jurisdictionId, oldValue);
                if (newDepartment) { newDisplayValue = newDepartment.name }
                if (oldDepartment) { oldDisplayValue = oldDepartment.name } else { oldDisplayValue = 'No Department' }
            } else {
                newDisplayValue = 'No Department';
            }
            fieldName = 'Department';
        } else if (key === 'serviceId') {
            if (value) {
                const newService = await Service.findOne(jurisdictionId, value);
                const oldService = await Service.findOne(jurisdictionId, oldValue);
                if (newService) { newDisplayValue = newService.name }
                if (oldService) { oldDisplayValue = oldService.name } else { oldDisplayValue = 'No Service' }
            } else {
                newDisplayValue = 'No Service';
            }
            fieldName = 'Service';
        }
        const auditMessage = makeAuditMessage(extraData?.user, fieldName, oldDisplayValue, newDisplayValue);
        await ServiceRequest.createComment(
            jurisdictionId, record.id, { comment: auditMessage, addedBy: extraData?.user?.id }
        );
        return record;

    }

}
