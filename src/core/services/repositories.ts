import { injectable } from 'inversify';
import { databaseEngine } from '../../db';
import { IServiceRepository } from '../../types';

@injectable()
export class ServiceRepository implements IServiceRepository {
    /* eslint-disable */
    async findOne(clientId: string, code: string): Promise<any> {
        return await databaseEngine.models.Service.findOne({
            where: {
                clientId,
                code,
            },
            raw: true,
        });
    }
    /* eslint-enable */

    /* eslint-disable */
    async findAll(clientId: string): Promise<[any, number]> {
        const { rows, count } = await databaseEngine.models.Service.findAndCountAll({
            where: {
                clientId,
            },
            order: [
                ['parentId', 'ASC'],
                ['name', 'ASC'],
            ],
            raw: true,
        });
        return [rows, count];
    }
    /* eslint-disable */
}
