import { inject, injectable } from 'inversify';
import logger from '../../logging';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppSettings, ChannelStatusCreateAttributes,
    ChannelStatusInstance,
    CommunicationAttributes,
    CommunicationCreateAttributes,
    CommunicationInstance,
    EmailEventAttributes, ICommunicationRepository,
    IEmailStatusRepository,
    IInboundEmailRepository,
    InboundEmailDataAttributes,
    InboundMapAttributes,
    InboundMapInstance,
    Models,
    ServiceRequestAttributes,
    ServiceRequestCommentAttributes,
    ServiceRequestCommentInstance,
    ServiceRequestInstance, StaffUserInstance, StatusLogEntry
} from '../../types';
import { canSubmitterComment, extractServiceRequestfromInboundEmail } from './helpers';
import { EMAIL_EVENT_MAP } from './models';

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
        const { InboundMap } = this.models;
        let record: ServiceRequestAttributes | ServiceRequestCommentAttributes;
        const [cleanedData, publicId] = await extractServiceRequestfromInboundEmail(
            { subject, to, cc, bcc, from, text, headers }, inboundEmailDomain, InboundMap
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

@injectable()
export class EmailStatusRepository implements IEmailStatusRepository {

    models: Models;
    settings: AppSettings;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppSettings) settings: AppSettings,
    ) {
        this.models = models;
        this.settings = settings
    }

    async create(data: ChannelStatusCreateAttributes): Promise<ChannelStatusInstance> {
        const { ChannelStatus } = this.models;
        return await ChannelStatus.create(data) as ChannelStatusInstance;
    }

    async createFromEvent(data: EmailEventAttributes): Promise<ChannelStatusInstance> {
        const { ChannelStatus } = this.models;
        const { email, event, type } = data;
        let eventKey = event;
        if (event === 'bounced') {
            eventKey = type as string;
        }
        const status = EMAIL_EVENT_MAP[eventKey];
        const statusLogEntry = [eventKey, EMAIL_EVENT_MAP[eventKey]] as StatusLogEntry;
        const exists = await ChannelStatus.findOne({ where: { id: email } }) as ChannelStatusInstance;
        let record;
        if (exists) {
            exists.status = status
            exists.statusLog.unshift(statusLogEntry)
            record = exists.save()
        } else {
            const statusLog = [statusLogEntry];
            record = await ChannelStatus.create(
                { id: email, channel: 'email', status, statusLog }
            ) as ChannelStatusInstance;
        }
        return record;
    }

    async findOne(email: string): Promise<ChannelStatusInstance> {
        const { ChannelStatus } = this.models;
        const record = await ChannelStatus.findOne(
            { where: { id: email, channel: 'email' }, order: [['createdAt', 'DESC']] }
        ) as ChannelStatusInstance;
        return record;
    }

}
