import { inject, injectable } from 'inversify';
import _ from 'lodash';
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
    InboundMapInstance, LogEntry, Models,
    ServiceRequestAttributes, ServiceRequestCommentInstance,
    ServiceRequestInstance, StaffUserInstance
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
        Promise<[ServiceRequestAttributes, boolean]> {
        const { ServiceRequest, ServiceRequestComment, StaffUser } = this.models;
        const { subject, to, cc, bcc, from, text, headers } = inboundEmailData;
        const { inboundEmailDomain } = this.settings;
        const { InboundMap } = this.models;
        let intermediateRecord: ServiceRequestInstance;
        let recordCreated = true;
        const [cleanedData, publicId] = await extractServiceRequestfromInboundEmail(
            { subject, to, cc, bcc, from, text, headers }, inboundEmailDomain, InboundMap
        );
        if (publicId || cleanedData.serviceRequestId) {
            const staffUsers = await StaffUser.findAll({ where: { jurisdictionId: cleanedData.jurisdictionId } });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const staffEmails = staffUsers.map((user: StaffUserInstance) => { return user.email }) as string[];
            let addedBy = '__SUBMITTER__';
            if (staffEmails.includes(cleanedData.email)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                addedBy = _.find(staffUsers, (u) => { return u.email === cleanedData.email })
            }
            let params = { jurisdictionId: cleanedData.jurisdictionId };
            if (cleanedData.serviceRequestId) {
                params = Object.assign({}, params, { id: cleanedData.serviceRequestId });
            } else {
                params = Object.assign({}, params, { publicId });
            }
            intermediateRecord = await ServiceRequest.findOne(
                {
                    where: params,
                    include: [
                        { model: ServiceRequestComment, as: 'comments' },
                        { model: InboundMap, as: 'inboundMaps' }
                    ],
                }
            ) as ServiceRequestInstance;
            recordCreated = false;
            const canComment = canSubmitterComment(cleanedData.email, [...staffEmails, intermediateRecord.email]);
            if (canComment && intermediateRecord) {
                const comment = { comment: cleanedData.description, serviceRequestId: intermediateRecord.id, addedBy };
                await ServiceRequestComment.create(comment) as ServiceRequestCommentInstance;
            } else {
                const dataToLog = { message: 'Invalid Comment Submitter.' }
                logger.error(dataToLog);
                throw new Error(dataToLog.message);
            }
        } else {
            // need to do this because sequelize cant return existing associations on a create,
            // in the case where the associations are not being created
            intermediateRecord = await ServiceRequest.create(cleanedData) as ServiceRequestInstance;
        }
        // requery to ensure we have all relations
        const record = await ServiceRequest.findByPk(
            intermediateRecord.id,
            {
                include: [
                    { model: ServiceRequestComment, as: 'comments' },
                    { model: InboundMap, as: 'inboundMaps' }
                ]
            }
        ) as ServiceRequestInstance;
        return [record, recordCreated];
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
        const isAllowed = EMAIL_EVENT_MAP[eventKey];
        const logEntry = [eventKey, EMAIL_EVENT_MAP[eventKey]] as LogEntry;
        const exists = await ChannelStatus.findOne({ where: { id: email } }) as ChannelStatusInstance;
        let record;
        if (exists) {
            exists.isAllowed = isAllowed
            exists.log.unshift(logEntry)
            record = exists.save()
        } else {
            const log = [logEntry];
            record = await ChannelStatus.create(
                { id: email, channel: 'email', isAllowed, log }
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
