import { inject, injectable } from 'inversify';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppSettings, CommunicationAttributes, CommunicationCreateAttributes, CommunicationInstance,
    ICommunicationRepository, Models
} from '../../types';

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
