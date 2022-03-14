import { inject, injectable } from 'inversify';
import logger from '../../logging';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppSettings,
    CommunicationAttributes,
    CommunicationCreateAttributes,
    CommunicationInstance,
    ICommunicationRepository,
    IInboundEmailRepository,
    InboundEmailDataAttributes,
    InboundMapAttributes,
    InboundMapInstance,
    Models,
    ServiceRequestAttributes,
    ServiceRequestCommentAttributes,
    ServiceRequestCommentInstance,
    ServiceRequestInstance, StaffUserInstance
} from '../../types';
import { canSubmitterComment, extractServiceRequestfromInboundEmail } from './helpers';

@injectable()
export class CommunicationRepository implements ICommunicationRepository {

    models: Models;
    settings: AppSettings;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppSettings) settings: AppSettings,
    ) {
        this.models = models;
        this.settings = settings
    }

    async create(data: CommunicationCreateAttributes): Promise<CommunicationAttributes> {
        const { Communication } = this.models;
        return await Communication.create(data) as CommunicationInstance;
    }

    async findByServiceRequestId(serviceRequestId: string): Promise<[CommunicationAttributes[], number]> {
        const { Communication } = this.models;
        const params = { where: { serviceRequestId } }
        const records = await Communication.findAll(params);
        return [records as CommunicationInstance[], records.length];
    }

}

@injectable()
export class InboundEmailRepository implements IInboundEmailRepository {

    models: Models;
    settings: AppSettings;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppSettings) settings: AppSettings,
    ) {
        this.models = models;
        this.settings = settings
    }

    async createServiceRequest(inboundEmailData: InboundEmailDataAttributes):
        Promise<ServiceRequestAttributes | ServiceRequestCommentAttributes> {
        const { ServiceRequest, ServiceRequestComment, StaffUser } = this.models;
        const { subject, to, cc, bcc, from, text, headers } = inboundEmailData;
        const { inboundEmailDomain } = this.settings;
        let record: ServiceRequestAttributes | ServiceRequestCommentAttributes;
        const [cleanedData, publicId] = extractServiceRequestfromInboundEmail(
            { subject, to, cc, bcc, from, text, headers }, inboundEmailDomain
        );
        if (publicId) {
            const staffUsers = await StaffUser.findAll({ where: { jurisdictionId: cleanedData.jurisdictionId } });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const staffEmails = staffUsers.map((user: StaffUserInstance) => { return user.email });
            const params = { where: { jurisdictionId: cleanedData.jurisdictionId, publicId } };
            const existingRequest = await ServiceRequest.findOne(params) as unknown as ServiceRequestInstance;
            const canComment = canSubmitterComment(cleanedData.email, [...staffEmails, existingRequest.email]);
            if (canComment && existingRequest) {
                const comment = { comment: cleanedData.description, serviceRequestId: existingRequest.id };
                record = await ServiceRequestComment.create(comment) as ServiceRequestCommentInstance;
            } else {
                const dataToLog = { message: 'Invalid Comment Submitter.' }
                logger.error(dataToLog);
                throw new Error(dataToLog.message);
            }
        } else {
            record = await ServiceRequest.create(cleanedData) as ServiceRequestInstance;
        }
        return record;
    }

    async createMap(data: InboundMapAttributes): Promise<InboundMapAttributes> {
        const { InboundMap } = this.models;
        const record = await InboundMap.create(data) as InboundMapInstance;
        return record;
    }

}
