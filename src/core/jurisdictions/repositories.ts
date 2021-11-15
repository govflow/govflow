import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IJurisdictionRepository, QueryResult } from '../../types';

@injectable()
export class JurisdictionRepository implements IJurisdictionRepository {

    async create(data: Record<string, unknown>): Promise<QueryResult> {
        const { Jurisdiction } = databaseEngine.models;
        const params = data;
        return await Jurisdiction.create(params);
    }

    async findOne(id: string): Promise<QueryResult> {
        const { Jurisdiction } = databaseEngine.models;
        const params = { where: { id }, raw: true, nest: true };
        return await Jurisdiction.findOne(params);
    }

}
