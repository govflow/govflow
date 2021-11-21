import { injectable } from 'inversify';
import { IJurisdictionRepository, QueryResult } from '../../types';

@injectable()
export class JurisdictionRepository implements IJurisdictionRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { Jurisdiction } = this.models;
        /* eslint-enable */
        const params = data;
        return await Jurisdiction.create(params);
    }

    async findOne(id: string): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { Jurisdiction } = this.models;
        /* eslint-enable */
        const params = { where: { id }, raw: true, nest: true };
        return await Jurisdiction.findOne(params);
    }

}
