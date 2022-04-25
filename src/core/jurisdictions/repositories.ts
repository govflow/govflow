import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { appIds } from '../../registry/service-identifiers';
import {
    AppSettings,
    IJurisdictionRepository,
    JurisdictionAttributes,
    JurisdictionInstance,
    Models
} from '../../types';

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

    async update(id: string, data: Partial<JurisdictionAttributes>): Promise<JurisdictionAttributes> {
        const { Jurisdiction } = this.models;
        const allowUpdateFields = [
            'name',
            'email',
            'sendFromEmail',
            'sendFromEmailVerified',
            'replyToEmail',
            'replyToServiceRequestEnabled',
            'address',
            'city',
            'state',
            'country',
            'zip'
        ];
        const safeData = _.pick(data, allowUpdateFields);
        const record = await Jurisdiction.findByPk(id) as JurisdictionInstance;
        for (const [key, value] of Object.entries(safeData)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            record[key] = value;
        }
        return await record.save();
    }

}
