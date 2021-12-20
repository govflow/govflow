import { injectable } from 'inversify';
import { IJurisdictionRepository, JurisdictionAttributes } from '../../types';

@injectable()
export class JurisdictionRepository implements IJurisdictionRepository {

    async create(data: JurisdictionAttributes): Promise<JurisdictionAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { Jurisdiction } = this.models;
        /* eslint-enable */
        const params = data;
        return await Jurisdiction.create(params);
    }

    async findOne(id: string): Promise<JurisdictionAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { Jurisdiction } = this.models;
        /* eslint-enable */
        const params = { where: { id } };
        return await Jurisdiction.findOne(params);
    }

}
