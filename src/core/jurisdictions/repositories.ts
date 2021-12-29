import { inject, injectable } from 'inversify';
import { appIds } from '../../registry/service-identifiers';
import { AppSettings, IJurisdictionRepository, JurisdictionAttributes, JurisdictionInstance, Models } from '../../types';

@injectable()
export class JurisdictionRepository implements IJurisdictionRepository {

    models: Models;
    settings: AppSettings;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppSettings) settings: AppSettings,
    ) {
        this.models = models;
        this.settings = settings
    }

    async create(data: Partial<JurisdictionAttributes>): Promise<JurisdictionAttributes> {
        const { Jurisdiction } = this.models;
        const params = data;
        return await Jurisdiction.create(params) as JurisdictionInstance;
    }

    async findOne(id: string): Promise<JurisdictionAttributes> {
        const { Jurisdiction } = this.models;
        const params = { where: { id } };
        return await Jurisdiction.findOne(params) as JurisdictionInstance;
    }

}
