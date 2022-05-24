import { inject, injectable } from 'inversify';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppConfig, ChannelIsAllowed, ChannelStatusCreateAttributes,
    ChannelStatusInstance,
    CommunicationAttributes,
    CommunicationCreateAttributes,
    CommunicationInstance,
    EmailEventAttributes,
    ICommunicationRepository,
    IEmailStatusRepository,
    IInboundMapRepository,
    InboundMapCreateAttributes,
    InboundMapInstance,
    LogEntry,
    Models
} from '../../types';
import { EMAIL_EVENT_MAP } from './models';

@injectable()
export class CommunicationRepository implements ICommunicationRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config
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
export class EmailStatusRepository implements IEmailStatusRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config
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

    async findOne(email: string): Promise<ChannelStatusInstance | null> {
        const { ChannelStatus } = this.models;
        const record = await ChannelStatus.findOne(
            { where: { id: email, channel: 'email' }, order: [['createdAt', 'DESC']] }
        ) as ChannelStatusInstance | null;
        return record;
    }

    async isAllowed(base64Email: string): Promise<ChannelIsAllowed> {
        const email = Buffer.from(base64Email, 'base64url').toString('ascii');
        const existingRecord = this.findOne(email);
        let isAllowed = true;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (existingRecord && existingRecord.isAllowed === false) {
            isAllowed = false;
        }
        return { id: base64Email, isAllowed };
    }

}

@injectable()
export class InboundMapRepository implements IInboundMapRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config
    }

    async create(data: InboundMapCreateAttributes): Promise<InboundMapInstance> {
        const { InboundMap } = this.models;
        return await InboundMap.create(data) as InboundMapInstance;
    }

    async findOne(id: string): Promise<InboundMapInstance | null> {
        const { InboundMap } = this.models;
        const record = await InboundMap.findOne(
            { where: { id }, order: [['createdAt', 'DESC']] }
        ) as InboundMapInstance | null;
        return record;
    }

}