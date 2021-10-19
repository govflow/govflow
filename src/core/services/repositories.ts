import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IServiceRepository, ReturnedModel } from '../../types';

@injectable()
export class ServiceRepository implements IServiceRepository {

    async findOne(clientId: string, code: string): Promise<ReturnedModel> {
        return await databaseEngine.models.Service.findOne({
            where: {
                clientId,
                code,
            },
            raw: true,
        });
    }

    async findAll(clientId: string): Promise<[ReturnedModel[], number]> {
        const { rows, count } = await databaseEngine.models.Service.findAndCountAll({
            where: {
                clientId,
            },
            order: [['parentId', 'ASC'], ['name', 'ASC']],
            raw: true,
        });
        return [rows, count];
    }

}
