import { injectable } from 'inversify';
import { Op } from 'sequelize';
import { databaseEngine } from '../../db';
import { IServiceRepository, IterableQueryResult, QueryResult } from '../../types';

@injectable()
export class ServiceRepository implements IServiceRepository {

    async findOne(clientId: string, id: string): Promise<QueryResult> {
        const { Service } = databaseEngine.models;
        return await Service.findOne({
            where: { clientId, id },
            include: [
                { model: Service, as: 'parent' },
                { model: Service, as: 'children' },
            ]
        });
    }

    async findAll(clientId: string, leafOnly: boolean): Promise<[IterableQueryResult, number]> {
        const { Service } = databaseEngine.models;
        const relatedExcludes = [
            'service_code',
            'service_name',
            'metadata',
            'type',
            'keywords',
            'group',
            'extraAttrs',
            'createdAt',
            'updatedAt',
            'parentId',
            'clientId'
        ];
        const whereParams = leafOnly ? { clientId, parentId: { [Op.ne]: null } } : { clientId };
        const records = await Service.findAll({
            where: whereParams,
            include: [
                { model: Service, as: 'parent', attributes: { exclude: relatedExcludes } },
                { model: Service, as: 'children', attributes: { exclude: relatedExcludes } },
            ],
        });
        return [records, records.length];
    }

    async create(clientId: string, payload: Record<string, unknown>): Promise<QueryResult> {
        const { Service } = databaseEngine.models;
        // handle group attribute from Open311
        const { service_code, service_name, group } = payload;
        delete payload.group;
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const [parent, _] = await Service.findOrCreate({
            where: { name: group, id: group, clientId },
        });
        /* eslint-enable @typescript-eslint/no-unused-vars */
        /* eslint-disable */
        // @ts-ignore
        const params = Object.assign({}, payload, { clientId, parentId: parent.id, id: service_code, name: service_name });
        /* eslint-enable */
        return await Service.create(params);
    }

}
