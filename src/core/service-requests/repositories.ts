import merge from 'deepmerge';
import { inject, injectable } from 'inversify';
import _ from 'lodash';
import sequelize, { Op } from 'sequelize';
import { SERVICE_TYPE_MISSING_ID, SERVICE_TYPE_MISSING_NAME } from '../../constants';
import { queryParamsToSequelize } from '../../helpers';
import { appIds } from '../../registry/service-identifiers';
import type {
  AppConfig, DepartmentAttributes,
  InboundMapInstance,
  IServiceRequestRepository,
  JurisdictionAttributes,
  Models,
  QueryParamsAll,
  ServiceAttributes,
  ServiceRequestAnonAttributes,
  ServiceRequestAttributes,
  ServiceRequestCommentAttributes,
  ServiceRequestCommentCreateAttributes,
  ServiceRequestCommentInstance,
  ServiceRequestCreateAttributes,
  ServiceRequestInstance,
  ServiceRequestStatusAttributes
} from '../../types';
import { REQUEST_STATUSES, SERVICE_REQUEST_CLOSED_STATES } from './models';


@injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {

  models: Models;
  config: AppConfig;

  constructor(
    @inject(appIds.Models) models: Models,
    @inject(appIds.AppConfig) config: AppConfig,
  ) {
    this.models = models;
    this.config = config;
  }

  async create(data: ServiceRequestCreateAttributes): Promise<ServiceRequestAttributes> {
    const { ServiceRequest, ServiceRequestComment, InboundMap } = this.models;
    // need to do this because sequelize cant return existing associations on a create,
    // in the case where the associations are not being created
    const createdRecord = await ServiceRequest.create(data) as ServiceRequestInstance;
    const record = await ServiceRequest.findByPk(
      createdRecord.id,
      {
        include: [
          { model: ServiceRequestComment, as: 'comments' },
          { model: InboundMap, as: 'inboundMaps' }
        ]
      },
    ) as ServiceRequestInstance;
    // ensure we have an inbound routing email
    await InboundMap.create({
      id: record.id.replaceAll('-', ''),
      jurisdictionId: record.jurisdictionId,
      serviceRequestId: record.id
    }) as InboundMapInstance;

    // re-querying to get all properties that are set in `findOne`
    return await this.findOne(record.jurisdictionId, record.id);
  }

  async update(jurisdictionId: string, id: string, data: Partial<ServiceRequestAttributes>):
    Promise<ServiceRequestAttributes> {
    const { ServiceRequest } = this.models;
    const allowUpdateFields = [
      'assignedTo', 'serviceId', 'departmentId', 'status', 'address', 'geometry', 'address_id', 'email', 'phone'
    ]
    const safeData = Object.assign({}, _.pick(data, allowUpdateFields), { id, jurisdictionId });
    let record = await ServiceRequest.findByPk(id) as ServiceRequestInstance;
    for (const [key, value] of Object.entries(safeData)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      record[key] = value;
    }
    record = await record.save();
    // re-querying to get all properties that are set in `findOne`
    return await this.findOne(record.jurisdictionId, record.id);
  }

  async findOne(jurisdictionId: string, id: string): Promise<ServiceRequestAttributes> {
    const { ServiceRequest, ServiceRequestComment, InboundMap } = this.models;
    const params = {
      where: { jurisdictionId, id },
      include: [
        { model: ServiceRequestComment, as: 'comments' },
        { model: InboundMap, as: 'inboundMaps' }
      ],
      order: [
        [{ model: ServiceRequestComment, as: 'comments' }, 'createdAt', 'ASC']
      ]
    };
    // sequelize v6 typescript does not like the order clause
    // even though it is valid so, need to ts-ignore
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const record = await ServiceRequest.findOne(params) as ServiceRequestInstance;
    return record;
  }

  async findOneByPublicId(jurisdictionId: string, publicId: string): Promise<ServiceRequestAttributes> {
    const { ServiceRequest, ServiceRequestComment, InboundMap } = this.models;
    const params = {
      where: { jurisdictionId, publicId },
      include: [
        { model: ServiceRequestComment, as: 'comments' },
        { model: InboundMap, as: 'inboundMaps' }
      ],
      order: [
        [{ model: ServiceRequestComment, as: 'comments' }, 'createdAt', 'ASC']
      ]
    };
    // sequelize v6 typescript does not like the order clause
    // even though it is valid so, need to ts-ignore
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const record = await ServiceRequest.findOne(params) as ServiceRequestInstance;
    return record;
  }

  async findAll(jurisdictionId: string, queryParams?: QueryParamsAll): Promise<[ServiceRequestAttributes[], number]> {
    const { ServiceRequest } = this.models;
    const params = merge(
      queryParamsToSequelize(queryParams), { where: { jurisdictionId }, order: [['createdAt', 'DESC']] }
    );
    const records = await ServiceRequest.findAll(params) as ServiceRequestInstance[];
    return [records, records.length];
  }

  async findAllForSubmitter(
    jurisdictionId: string, channel: string, submitterId: string
  ): Promise<[ServiceRequestAttributes[], number]> {
    const { ServiceRequest } = this.models;
    // TODO: support channel to get the submitterId from email or phone fields
    // currently, we know it is a phone based on the usage of this method
    // only for disambiguation of inbound sms data

    const params = {
      where: {
        jurisdictionId,
        channel,
        phone: submitterId,
        status: { [Op.notIn]: SERVICE_REQUEST_CLOSED_STATES }
      }
    };
    const records = await ServiceRequest.findAll(params) as ServiceRequestInstance[];
    return [records, records.length];
  }

  async getStats(
    jurisdictionId: string,
    queryParams?: QueryParamsAll
  ): Promise<Record<string, Record<string, number>>> {
    const { ServiceRequest } = this.models;
    const params = merge(queryParamsToSequelize(queryParams), { where: { jurisdictionId } });
    params.attributes = ['status', [sequelize.fn('COUNT', 'id'), 'count']];
    params.group = ['status'];
    const records = await ServiceRequest.findAll(params);
    const recordsAsData = records.map((record) => { return record.get() })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const countByStatus: Record<string, number> = recordsAsData.reduce(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (agg: Record<string, number>, item: { status: string, count: string }) => (
        { ...agg, [item.status]: parseInt(item.count, 10) }
      ),
      {},
    );
    return { countByStatus };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findStatusList(jurisdictionId: string): Promise<ServiceRequestStatusAttributes[]> {
    const serviceRequestStatusList: ServiceRequestStatusAttributes[] = [];
    for (const [key, value] of Object.entries(REQUEST_STATUSES)) {
      const isClosed = SERVICE_REQUEST_CLOSED_STATES.includes(key);
      let label = value;
      if (isClosed) { label = `${value} [Closed]` }
      serviceRequestStatusList.push({ id: key, label, isClosed })
    }
    return Promise.resolve(serviceRequestStatusList);
  }

  async createComment(
    jurisdictionId: string,
    serviceRequestId: string,
    data: ServiceRequestCommentCreateAttributes,
  ): Promise<[ServiceRequestAttributes, ServiceRequestCommentAttributes]> {
    const { ServiceRequestComment } = this.models;
    const comment = await ServiceRequestComment.create(
      Object.assign({}, data, { serviceRequestId })
    ) as ServiceRequestCommentInstance;
    const record = await this.findOne(jurisdictionId, serviceRequestId);
    return [record, comment];
  }

  async updateComment(
    jurisdictionId: string,
    serviceRequestId: string,
    serviceRequestCommentId: string,
    data: Partial<ServiceRequestCommentAttributes>
  ): Promise<ServiceRequestCommentAttributes> {

    const { ServiceRequestComment } = this.models;
    const record = await ServiceRequestComment.findByPk(serviceRequestCommentId) as ServiceRequestCommentInstance;
    for (const [key, value] of Object.entries(data)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      record[key] = value;
    }
    return await record.save();
  }

  async getAnonData(jurisdictionId: string, id: string): Promise<ServiceRequestAnonAttributes | null> {
    const { Service, Department, Jurisdiction } = this.models;
    const record = await this.findOne(jurisdictionId, id) as ServiceRequestInstance;
    if (record) {
      const jurisdiction = await Jurisdiction.findOne(
        { where: { id: record.jurisdictionId } }
      ) as JurisdictionAttributes | null;
      const department = await Department.findOne(
        { where: { id: record.departmentId } }
      ) as DepartmentAttributes | null;
      const service = await Service.findOne({ where: { id: record.serviceId } }) as ServiceAttributes | null;
      let serviceId = SERVICE_TYPE_MISSING_ID;
      let serviceName = SERVICE_TYPE_MISSING_NAME;
      let departmentName = null;
      let jurisdictionName = null;
      if (service) { serviceName = service.name; serviceId = service.id; }
      if (department) { departmentName = department.name; }
      if (jurisdiction) { jurisdictionName = jurisdiction.name; }
      return {
        id: record.id,
        publicId: record.publicId,
        serviceId: serviceId,
        serviceName: serviceName,
        departmentId: record.departmentId,
        departmentName: departmentName,
        jurisdictionId: jurisdictionId,
        jurisdictionName: jurisdictionName as string,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        closeDate: record.closeDate || record.updatedAt, // if trigger state is not a closed state, then there will be no closedDate
        context: '311'
      }
    }
    return null;
  }

}
