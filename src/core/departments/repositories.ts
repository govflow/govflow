import { injectable } from 'inversify';
import { DepartmentAttributes, IDepartmentRepository, QueryParamsAll } from '../../types';

@injectable()
export class DepartmentRepository implements IDepartmentRepository {

    async create(data: DepartmentAttributes): Promise<DepartmentAttributes> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { Department } = this.models;
        const params = data;
        return await Department.create(params);
    }

    async update(
        jurisdictionId: string,
        id: string,
        data: Partial<DepartmentAttributes>
    ): Promise<DepartmentAttributes> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { Department } = this.models;
        const params = { where: { jurisdictionId, id } };
        const record = await Department.findOne(params);
        for (const [key, value] of Object.entries(data)) {
            record[key] = value;
        }
        return await record.save();
    }

    async findOne(jurisdictionId: string, id: string): Promise<DepartmentAttributes> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const { Department } = this.models;
        const params = { where: { jurisdictionId, id } };
        return await Department.findOne(params);
    }

    async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[DepartmentAttributes[], number]> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const { Department } = this.models;
        const records = await Department.findAll({
            where: Object.assign({}, queryParams?.whereParams, { jurisdictionId }),
        });
        return [records, records.length];
    }

}
