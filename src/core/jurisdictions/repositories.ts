import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { appIds } from '../../registry/service-identifiers';
import {
    AppConfig,
    IJurisdictionRepository,
    JurisdictionAttributes,
    JurisdictionInstance,
    Models, StaffUserInstance
} from '../../types';

@injectable()
export class JurisdictionRepository implements IJurisdictionRepository {

    models: Models;
    settings: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) settings: AppConfig,
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

    async hasStaffUser(id: string, staffUserId: string): Promise<boolean> {
        const { StaffUser } = this.models;
        const params = { where: { id: staffUserId, jurisdictionId: id } };
        return Boolean(await StaffUser.findOne(params) as StaffUserInstance);
    }

}
