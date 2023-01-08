import { inject, injectable } from 'inversify';
import { merge } from 'lodash';
import { FindOptions } from 'sequelize/types';
import { queryParamsToSequelize } from '../../helpers';
import { appIds } from '../../registry/service-identifiers';
import type {
  AppConfig, ChannelIsAllowed, ChannelStatusCreateAttributes,
  ChannelStatusInstance,
  ChannelType,
  CommunicationAttributes,
  CommunicationCreateAttributes,
  CommunicationInstance,
  EmailEventAttributes,
  ICommunicationRepository,
  IEmailStatusRepository,
  IInboundMapRepository,
  IMessageDisambiguationRepository,
  InboundMapCreateAttributes,
  InboundMapInstance,
  ISmsStatusRepository,
  ITemplateRepository,
  LogEntry,
  MessageDisambiguationAttributes,
  MessageDisambiguationCreateAttributes,
  MessageDisambiguationInstance,
  Models,
  QueryParamsAll,
  SmsEventAttributes,
  TemplateAttributes,
  TemplateCreateAttributes,
  TemplateInstance
} from '../../types';
import { EMAIL_EVENT_MAP, SMS_EVENT_MAP } from './models';

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
export class SmsStatusRepository implements ISmsStatusRepository {

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

    async createFromEvent(data: SmsEventAttributes): Promise<ChannelStatusInstance> {
        const { ChannelStatus } = this.models;
        const { From, MessageStatus } = data;
        const eventKey = MessageStatus;
        const isAllowed = SMS_EVENT_MAP[eventKey];
        const logEntry = [eventKey, SMS_EVENT_MAP[eventKey]] as LogEntry;
        const exists = await ChannelStatus.findOne({ where: { id: From } }) as ChannelStatusInstance;
        let record;
        if (exists) {
            exists.isAllowed = isAllowed
            exists.log.unshift(logEntry)
            record = exists.save()
        } else {
            const log = [logEntry];
            record = await ChannelStatus.create(
                { id: From, channel: 'phone', isAllowed, log }
            ) as ChannelStatusInstance;
        }
        return record;
    }

    async findOne(phone: string): Promise<ChannelStatusInstance | null> {
        const { ChannelStatus } = this.models;
        const record = await ChannelStatus.findOne(
            { where: { id: phone, channel: 'phone' }, order: [['createdAt', 'DESC']] }
        ) as ChannelStatusInstance | null;
        return record;
    }

    async isAllowed(base64Phone: string): Promise<ChannelIsAllowed> {
        const email = Buffer.from(base64Phone, 'base64url').toString('ascii');
        const existingRecord = this.findOne(email);
        let isAllowed = true;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (existingRecord && existingRecord.isAllowed === false) {
            isAllowed = false;
        }
        return { id: base64Phone, isAllowed };
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

    async findOne(id: string, channel: ChannelType): Promise<InboundMapInstance | null> {
        const { InboundMap } = this.models;
        const record = await InboundMap.findOne(
            { where: { id, channel }, order: [['createdAt', 'DESC']] }
        ) as InboundMapInstance | null;
        return record;
    }

}

@injectable()
export class MessageDisambiguationRepository implements IMessageDisambiguationRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config
    }

    async create(data: MessageDisambiguationCreateAttributes): Promise<MessageDisambiguationAttributes> {
        const { MessageDisambiguation } = this.models;
        return await MessageDisambiguation.create(data) as MessageDisambiguationInstance;
    }

    async findOne(jurisdictionId: string, submitterId: string): Promise<MessageDisambiguationAttributes> {
        const { MessageDisambiguation } = this.models;
        const params = { where: { jurisdictionId, submitterId, status: 'open' } }
        const record = await MessageDisambiguation.findOne(params) as MessageDisambiguationInstance;
        return record;
    }

    async update(
        id: string,
        data: Partial<MessageDisambiguationAttributes>
    ): Promise<MessageDisambiguationAttributes> {
        const { MessageDisambiguation } = this.models;
        const params = { where: { id } };
        const record = await MessageDisambiguation.findOne(params) as MessageDisambiguationInstance;
        for (const [key, value] of Object.entries(data)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            record[key] = value;
        }
        return await record.save();
    }
}

@injectable()
export class TemplateRepository implements ITemplateRepository {

  models: Models;
  config: AppConfig;

  constructor(
    @inject(appIds.Models) models: Models,
    @inject(appIds.AppConfig) config: AppConfig,
  ) {
    this.models = models;
    this.config = config
  }

  async create(data: TemplateCreateAttributes): Promise<TemplateAttributes> {
    const { Template } = this.models;
    return await Template.create(data) as TemplateInstance;
  }

  async findOne(jurisdictionId: string, id: string): Promise<TemplateAttributes> {
    const { Template } = this.models;
    const params = { where: { jurisdictionId, id } }
    const record = await Template.findOne(params) as TemplateInstance;
    return record;
  }

  async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[TemplateAttributes[], number]> {
    const { Template } = this.models;
    const params = merge(
      queryParamsToSequelize(queryParams), { where: { jurisdictionId }, order: [['createdAt', 'DESC']] }
    ) as unknown as FindOptions<TemplateAttributes>;
    const records = await Template.findAll(params) as TemplateInstance[];
    return [records, records.length];
  }

  async update(
    jurisdictionId: string,
    id: string,
    data: Partial<TemplateAttributes>
  ): Promise<TemplateAttributes> {
    const { Template } = this.models;
    const params = { where: { id, jurisdictionId } };
    const record = await Template.findOne(params) as TemplateInstance;
    for (const [key, value] of Object.entries(data)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      record[key] = value;
    }
    return await record.save();
  }

  async delete(
    jurisdictionId: string,
    id: string
  ): Promise<void> {
    const { Template } = this.models;
    const params = { where: { id } };
    const record = await Template.findOne(params) as TemplateInstance;
    return await record.destroy();
  }
}