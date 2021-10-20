import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IClientRepository, QueryResult } from '../../types';

@injectable()
export class ClientRepository implements IClientRepository {

    async findOne(id: string): Promise<QueryResult> {
        return await databaseEngine.models.Client.findOne({
            where: { id },
            raw: true,
        });
    }

}
