import { inject, injectable } from 'inversify';
import { Where } from 'sequelize/types/lib/utils';
import { appIds } from '../../registry/service-identifiers';
import { AppConfig, DepartmentAttributes, DepartmentInstance, IDepartmentRepository, Models, QueryParamsAll } from '../../types';

@injectable()
export class DepartmentRepository implements IDepartmentRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config
    }

    async create(data: DepartmentAttributes): Promise<DepartmentAttributes> {
        const { Department } = this.models;
        const params = data;
        return await Department.create(params) as DepartmentInstance;
    }

    async update(
        jurisdictionId: string,
        id: string,
        data: Partial<DepartmentAttributes>
    ): Promise<DepartmentAttributes> {
        const { Department } = this.models;
        const params = { where: { jurisdictionId, id } };
        const record = await Department.findOne(params) as DepartmentInstance;
        for (const [key, value] of Object.entries(data)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            record[key] = value;
        }
        return await record.save();
    }

    async findOne(jurisdictionId: string, id: string): Promise<DepartmentAttributes> {
        const { Department } = this.models;
        const params = { where: { jurisdictionId, id } };
        return await Department.findOne(params) as DepartmentInstance;
    }

    async findOneByName(jurisdictionId: string, name: string): Promise<DepartmentAttributes> {
      const { Department } = this.models;
      const params = { where: { jurisdictionId, name } };
      return await Department.findOne(params) as DepartmentInstance;
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[DepartmentAttributes[], number]> {
        const { Department } = this.models;
        const records = await Department.findAll({
            where: Object.assign({}, queryParams?.whereParams, { jurisdictionId }) as unknown as Where,
        }) as DepartmentInstance[];
        return [records, records.length];
    }

}
