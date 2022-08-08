import { inject, injectable } from 'inversify';
import _ from 'lodash';
import logger from '../../logging';
import { appIds } from '../../registry/service-identifiers';
import {
    AppConfig,
    AuditedStateChangeExtraData,
    auditMessageFields,
    InboundEmailDataAttributes,
    InboundSmsDataAttributes,
    IServiceRequestService,
    MessageDisambiguationAttributes,
    ParsedServiceRequestAttributes,
    PublicId,
    Repositories,
    ServiceRequestAttributes,
    ServiceRequestCommentAttributes,
    ServiceRequestCreateAttributes,
    ServiceRequestInstance,
    ServiceRequestStateChangeErrorResponse,
    StaffUserAttributes
} from '../../types';
import {
    canSubmitterComment,
    extractServiceRequestfromInboundEmail,
    extractServiceRequestfromInboundSms,
    findIdentifiers,
    makeDisambiguationMessage,
    parseDisambiguationChoiceFromText
} from '../communications/helpers';
import { makeAuditMessage } from './helpers';
import { REQUEST_STATUSES } from './models';

@injectable()
export class ServiceRequestService implements IServiceRequestService {

    repositories: Repositories
    config: AppConfig
    NEW_REQUEST_IDENTIFIER: string

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppConfig) config: AppConfig,) {
        this.repositories = repositories;
        this.config = config;
        this.NEW_REQUEST_IDENTIFIER = 'New Request';
    }

    async create(data: ServiceRequestCreateAttributes): Promise<ServiceRequestAttributes> {
        const { serviceRequestRepository, serviceRepository } = this.repositories;

        const processedServiceRequest = { ...data };

        // Auto-assign to department by Service
        if (processedServiceRequest.serviceId && processedServiceRequest.jurisdictionId) {
            const service = await serviceRepository.findOne(
                processedServiceRequest.jurisdictionId,
                processedServiceRequest.serviceId,
            );
            if (service?.defaultDepartmentId) {
                processedServiceRequest.departmentId = service.defaultDepartmentId;
            }
        }

        return serviceRequestRepository.create(processedServiceRequest);
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

        // handle empty strings from client
        if (value == "" && ["departmentId", "serviceId"].includes(key)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            updateData[key] = null;
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            updateData[key] = value;
        }

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
                if (newAssignee) { newDisplayValue = newAssignee.displayName }
            } else {
                newDisplayValue = 'Unassigned';
            }
            const oldAssignee = await staffUserRepository.findOne(jurisdictionId, oldValue);
            if (oldAssignee) { oldDisplayValue = oldAssignee.displayName } else { oldDisplayValue = 'No Assignee' }
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
                if (newDepartment) { newDisplayValue = newDepartment.name }
            } else {
                newDisplayValue = 'No Department';
            }
            const oldDepartment = await departmentRepository.findOne(jurisdictionId, oldValue);
            if (oldDepartment) { oldDisplayValue = oldDepartment.name } else { oldDisplayValue = 'No Department'; }
            fieldName = 'Department';
            auditMessageFields.push({ fieldName, oldValue: oldDisplayValue, newValue: newDisplayValue });
        } else if (key === 'serviceId') {
            if (value) {
                const newService = await serviceRepository.findOne(jurisdictionId, value);
                if (newService) { newDisplayValue = newService.name }
            } else {
                newDisplayValue = 'No Service';
            }
            const oldService = await serviceRepository.findOne(jurisdictionId, oldValue);
            if (oldService) { oldDisplayValue = oldService.name } else { oldDisplayValue = 'No Service' }
            fieldName = 'Service';
            auditMessageFields.push({ fieldName, oldValue: oldDisplayValue, newValue: newDisplayValue });
        }
        const auditMessage = makeAuditMessage(extraData?.user, auditMessageFields);
        await serviceRequestRepository.createComment(
            jurisdictionId, record.id, { comment: auditMessage, addedBy: extraData?.user?.id }
        );
        return record;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inboundIsEmail(data: any): data is InboundEmailDataAttributes {
        const valids = ['to', 'from', 'subject', 'text', 'envelope', 'dkim', 'SPF'];
        const properties = Object.keys(data)
        return valids.every(value => properties.includes(value))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inboundIsSms(data: any): data is InboundSmsDataAttributes {
        const valids = ['To', 'From', 'Body', 'MessageSid', 'AccountSid', 'SmsMessageSid'];
        const properties = Object.keys(data)
        return valids.every(value => properties.includes(value))
    }

    async disambiguateInboundData(
        inboundData: InboundEmailDataAttributes | InboundSmsDataAttributes
    ): Promise<[boolean, string, string, PublicId?]> {
        const { serviceRequestRepository, messageDisambiguationRepository, inboundMapRepository } = this.repositories;
        let messageDisambiguationRecord: MessageDisambiguationAttributes | null = null,
            disambiguate = false,
            disambiguateResponse = '',
            disambiguatedPublicId = '',
            disambiguatedOriginalMessage = '';

        if (this.inboundIsSms(inboundData)) {

            // because it is SMS, we cant just create a new service request,
            // we need to disambiguate, which we might be able to do automatically,
            // or we maybe required to ask the submitter for more information.
            const { To, From, Body } = inboundData;
            const channel = 'sms', submitterId = From, body = Body;
            const { jurisdictionId } = await findIdentifiers(
                To, channel, inboundMapRepository
            );

            // does this submitter even have an existing open record?
            const [serviceRequests, _count] = await serviceRequestRepository.findAllForSubmitter(
                jurisdictionId, channel, submitterId
            );

            if (serviceRequests && serviceRequests.length > 0) {
                // The submitter has existing messages, so we do not know
                // for certain if this is a new service request or a comment on an
                // existing service request.

                // So, we need to disambiguate by asking the submitter for more information

                // And, we might already be in the middle of a disambiguation process
                // with the submitter, so our strategy is furthert dependant on if a
                // disambiguation record for this submitter is currently open.

                // So first, check if we have an open record
                messageDisambiguationRecord = await messageDisambiguationRepository.findOne(
                    jurisdictionId, submitterId
                );

                if (messageDisambiguationRecord) {
                    // We are in the middle of a disambiguation flow
                    const choice = parseDisambiguationChoiceFromText(body);
                    if (!choice) {
                        // We are unable to parse a valid choice from the inbound data
                        // So we need to message the submitter again.
                        const disambiguationFlow = messageDisambiguationRecord.disambiguationFlow
                        disambiguationFlow.push(body);
                        const disambiguationMessage = makeDisambiguationMessage(
                            'Your response was invalid. Try again.', messageDisambiguationRecord.choiceMap
                        );
                        disambiguationFlow.push(disambiguationMessage);
                        await messageDisambiguationRepository.update(messageDisambiguationRecord.id, {
                            disambiguationFlow
                        });
                        disambiguate = true;
                        disambiguateResponse = disambiguationMessage;
                    } else {
                        // we have a valid choice so we can now disambiguate the submitters original message
                        const choiceIdentifier = messageDisambiguationRecord.choiceMap[choice];
                        await messageDisambiguationRepository.update(messageDisambiguationRecord.id, {
                            status: 'closed'
                        });
                        disambiguatedPublicId = choiceIdentifier;
                        disambiguatedOriginalMessage = messageDisambiguationRecord.originalMessage;
                    }
                } else {
                    // We are starting a disambiguation flow so we need to create a record
                    const choiceMap = { 1: this.NEW_REQUEST_IDENTIFIER } as Record<number, string>;
                    for (const [index, request] of serviceRequests.entries()) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        choiceMap[index + 2] = request.publicId
                    }
                    const msg = `Please help us route your request correctly.\n\n
Respond with a number from the following choices so we know
whether you are creating a new service request, or responding to an existing one.`;
                    const disambiguationMessage = makeDisambiguationMessage(msg, choiceMap);
                    const disambiguationFlow = [disambiguationMessage];

                    messageDisambiguationRecord = await messageDisambiguationRepository.create({
                        jurisdictionId,
                        submitterId,
                        originalMessage: body,
                        disambiguationFlow,
                        choiceMap,
                    });
                    disambiguate = true;
                    disambiguateResponse = disambiguationMessage;
                }
            }
        }
        return [disambiguate, disambiguateResponse, disambiguatedOriginalMessage, disambiguatedPublicId];
    }

    async createServiceRequest(
        inboundData: InboundEmailDataAttributes | InboundSmsDataAttributes,
        originalMessage?: string,
        knownIdentifier?: string
    ):
        Promise<[ServiceRequestAttributes, ServiceRequestCommentAttributes | undefined]> {
        const {
            serviceRequestRepository,
            staffUserRepository,
            inboundMapRepository,
        } = this.repositories;
        const { inboundEmailDomain } = this.config;
        let intermediateRecord: ServiceRequestAttributes;
        let commentRecord: ServiceRequestCommentAttributes | undefined = undefined;
        let cleanedData: ParsedServiceRequestAttributes;
        let publicId: PublicId;
        let knownPublicId: PublicId;
        if (knownIdentifier && knownIdentifier !== this.NEW_REQUEST_IDENTIFIER) {
            knownPublicId = knownIdentifier;
        }

        if (this.inboundIsEmail(inboundData)) {
            const { subject, to, cc, bcc, from, text, headers } = inboundData;
            [cleanedData, publicId] = await extractServiceRequestfromInboundEmail(
                { subject, to, cc, bcc, from, text, headers }, inboundEmailDomain, inboundMapRepository
            );
        } else if (this.inboundIsSms(inboundData)) {
            const { To, From, Body } = inboundData;
            let originalBody = Body;
            if (originalMessage) { originalBody = originalMessage }
            [cleanedData, publicId] = await extractServiceRequestfromInboundSms(
                { To, From, Body: originalBody }, inboundMapRepository
            );
        } else {
            const dataToLog = { message: 'Invalid Comment Submitter.', data: inboundData }
            logger.error(dataToLog);
            throw new Error("Received an invalid inbound data payload");
        }

        if (knownPublicId || publicId || cleanedData.serviceRequestId) {
            const [staffUsers, _count] = await staffUserRepository.findAll(
                cleanedData.jurisdictionId, { whereParams: { isAdmin: true } }
            );
            const staffEmails = staffUsers.map((user: StaffUserAttributes) => { return user.email }) as string[];
            let addedBy = '__SUBMITTER__';
            if (staffEmails.includes(cleanedData.email)) {
                const staffUserMatch = _.find(
                    staffUsers, (u) => { return u.email === cleanedData.email }
                ) as StaffUserAttributes;
                addedBy = staffUserMatch.id;
            }
            if (knownPublicId) {
                intermediateRecord = await serviceRequestRepository.findOneByPublicId(
                    cleanedData.jurisdictionId, knownPublicId as unknown as string
                );
            } else if (cleanedData.serviceRequestId) {
                intermediateRecord = await serviceRequestRepository.findOne(
                    cleanedData.jurisdictionId, cleanedData.serviceRequestId
                );
            } else {
                intermediateRecord = await serviceRequestRepository.findOneByPublicId(
                    cleanedData.jurisdictionId, publicId as unknown as string
                );
            }
            const validEmails = [...staffEmails, intermediateRecord.email].filter(e => e);
            const validPhones = [intermediateRecord.phone].filter(e => e); // TODO: Add staff phones when we later support it
            const canComment = canSubmitterComment(cleanedData.email, cleanedData.phone, validEmails, validPhones);
            if (canComment && intermediateRecord) {
                const comment = {
                    comment: cleanedData.description,
                    addedBy,
                    // TODO: These are hard coded for now, but should really be made configurable via the InboundMap
                    // or some other means. The hardcoded assumption here is that inbound messages
                    // will be broadcast to staff and assignees
                    broadcastToStaff: true,
                    broadcastToAssignee: true,
                };
                commentRecord = await serviceRequestRepository.createComment(
                    cleanedData.jurisdictionId, intermediateRecord.id, comment
                );
            } else {
                const dataToLog = { message: 'Invalid Comment Submitter.', data: inboundData }
                logger.error(dataToLog);
                throw new Error(dataToLog.message);
            }
        } else {
            intermediateRecord = await this.create(
                cleanedData
            ) as ServiceRequestInstance;
        }

        // requery to ensure we have all relations
        const record = await serviceRequestRepository.findOne(
            cleanedData.jurisdictionId, intermediateRecord.id
        );
        return [record, commentRecord];
    }

}
