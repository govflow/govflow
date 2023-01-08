import faker from 'faker';
import type { Sequelize } from 'sequelize/types';
import { TEMPLATE_NAMES, TEMPLATE_TYPES } from '../core/communications';
import { REQUEST_STATUS_KEYS } from '../core/service-requests';
import { STAFF_USER_PERMISSIONS } from '../core/staff-users';
import { ChannelStatusAttributes, CommunicationAttributes, DepartmentAttributes, InboundMapAttributes, JurisdictionAttributes, ServiceAttributes, ServiceRequestAttributes, ServiceRequestCommentAttributes, ServiceRequestInstance, StaffUserAttributes, StaffUserDepartmentAttributes, StaffUserDepartmentModel, StaffUserModel, TemplateAttributes, TestDataMakerOptions, TestDataPayload } from '../types';

/* eslint-disable */
function factory(generator: Function, times: number, generatorOpts: {}) {
  const iterations = [...Array(times).keys()];
  const data: Record<string, unknown>[] = [];
  iterations.forEach(() => {
    data.push(generator(generatorOpts))
  })
  return data;
}
/* eslint-enable */

function makeJurisdiction() {
  return {
    id: faker.datatype.uuid(),
    name: faker.company.companyName(),
    email: faker.internet.email(),
    enforceAssignmentThroughDepartment: false
  } as JurisdictionAttributes;
}

function makeStaffUser(options: Partial<TestDataMakerOptions>) {
  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return {
    id: faker.datatype.uuid(),
    firstName: firstName,
    lastName: lastName,
    displayName: `${firstName} ${lastName}`,
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
    jurisdictionId: options.jurisdiction?.id,
    permissions: STAFF_USER_PERMISSIONS,
    isAdmin: true,
  } as StaffUserAttributes;
}

function makeService(options: Partial<TestDataMakerOptions>) {
  return {
    id: faker.datatype.uuid(),
    group: faker.datatype.string(),
    name: faker.datatype.string(),
    description: faker.lorem.sentences(5),
    tags: [faker.datatype.string(), faker.datatype.string()],
    type: faker.helpers.randomize(['realtime', 'batch', 'blackbox']),
    jurisdictionId: options.jurisdiction?.id,
  } as ServiceAttributes;
}

function makeServiceRequest(options: Partial<TestDataMakerOptions>) {
  const dates = [
    new Date('2021-12-01T00:00:00.000Z'),
    new Date('2021-11-01T00:00:00.000Z'),
    new Date('2021-10-01T00:00:00.000Z'),
    new Date('2021-09-01T00:00:00.000Z'),
    new Date('2021-08-01T00:00:00.000Z'),
    new Date('2021-07-01T00:00:00.000Z'),
    new Date('2021-06-01T00:00:00.000Z'),
    new Date('2021-05-01T00:00:00.000Z'),
    new Date('2021-04-01T00:00:00.000Z'),
    new Date('2021-03-01T00:00:00.000Z'),
    new Date('2021-02-01T00:00:00.000Z'),
    new Date('2021-01-01T00:00:00.000Z'),
  ]
  const phones = [
    null,
    faker.phone.phoneNumber(),
    faker.phone.phoneNumber(),
    faker.phone.phoneNumber()
  ]
  let phone = faker.helpers.randomize(phones)

  const emails = [
    null,
    faker.internet.email(),
    faker.internet.email(),
    faker.internet.email()
  ]
  let email = faker.helpers.randomize(emails)
  if (!email || !phone) {
    if (!email) { phone = faker.phone.phoneNumber() }
    if (!phone) { email = faker.internet.email() }
  }

  let channel = 'email';
  if (!email) {
    channel = 'sms';
  }

  return {
    id: faker.datatype.uuid(),
    description: faker.lorem.sentences(5),
    address: faker.address.streetAddress(),
    lat: faker.datatype.number({ precision: 0.0001 }),
    lon: faker.datatype.number({ precision: 0.0001 }),
    images: [`${faker.datatype.uuid()}.jpg`, `${faker.datatype.uuid()}.jpg`],
    status: faker.helpers.randomize(REQUEST_STATUS_KEYS),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: email,
    phone: phone,
    channel: channel,
    createdAt: faker.helpers.randomize(dates),
    updatedAt: faker.helpers.randomize(dates),
    inputChannel: 'webform',
    assignedTo: faker.helpers.randomize(options.staffUsers?.map((u) => { return u.id }) || []),
    serviceId: faker.helpers.randomize(options.services?.map((s) => { return s.id }) || []),
    jurisdictionId: options.jurisdiction?.id,
    comments: [makeServiceRequestComment(options), makeServiceRequestComment(options)]
  } as Partial<ServiceRequestAttributes>;
}

function makeServiceRequestComment(options: Partial<TestDataMakerOptions>) {
  return {
    id: faker.datatype.uuid(),
    comment: faker.lorem.sentences(5),
    addedBy: faker.helpers.randomize(options.staffUsers?.map((u) => { return u.id }) || []),
    images: [`${faker.datatype.uuid()}.jpg`, `${faker.datatype.uuid()}.jpg`],

  } as ServiceRequestCommentAttributes
}

function makeCommunication(options: Partial<TestDataMakerOptions>) {
  const channel = faker.helpers.randomize(['email', 'sms']);
  const address = channel === 'email' ? faker.internet.email() : faker.phone.phoneNumber();
  return {
    id: faker.datatype.uuid(),
    channel: channel,
    address: address,
    type: faker.helpers.randomize(['workflow', 'cx']),
    dispatched: true,
    dispatchPayload: {},
    dispatchResponse: {},
    accepted: true,
    delivered: true,
    serviceRequestId: options.serviceRequest?.id,
  } as CommunicationAttributes
}

function makeDepartment(options: Partial<TestDataMakerOptions>) {
  return {
    id: faker.datatype.uuid(),
    name: faker.datatype.string(),
    jurisdictionId: options.jurisdiction?.id,
  } as DepartmentAttributes
}

function makeInboundMap(options: Partial<TestDataMakerOptions>) {
  let id = faker.datatype.uuid();
  let channel = 'email';
  if (options.opts?.channel === 'sms') {
    id = faker.phone.phoneNumber();
    channel = 'sms';
  }
  return {
    id: id,
    channel: channel,
    jurisdictionId: options.jurisdiction?.id,
    departmentId: faker.helpers.randomize(options.departments as DepartmentAttributes[]).id,
    serviceRequestId: faker.helpers.randomize(options.serviceRequests as ServiceRequestAttributes[]).id,
    serviceId: faker.helpers.randomize(options.services as ServiceAttributes[]).id,
    staffUserId: faker.helpers.randomize(options.staffUsers as StaffUserAttributes[]).id,
  } as InboundMapAttributes
}
function makeStaffUserDepartments(staffUsers: StaffUserAttributes[], departments: DepartmentAttributes[]) {
  const staffUserDepartments: StaffUserDepartmentAttributes[] = [];
  for (const staffUser of staffUsers) {
    staffUserDepartments.push({
      staffUserId: staffUser.id,
      departmentId: faker.helpers.randomize(departments.map((d) => { return d.id })),
      isLead: true
    })
  }
  // make sure some are not leads
  for (const sud of staffUserDepartments.slice(5)) { // TODO: not just slice
    sud.isLead = false
  }
  return staffUserDepartments;
}

function makeChannelStatus() {
  const statuses = [
    ['delivered', true],
    ['group_resubscribe', true],
    ['blocked', false],
    ['dropped', false],
    ['processed', null],
    ['open', null],
  ];
  const statusGenerator = faker.helpers.randomize(statuses);
  const email = {
    id: faker.internet.email(),
    channel: 'email',
    isAllowed: statusGenerator[1],
    log: [statusGenerator]
  };
  const phone = {
    id: faker.phone.phoneNumber(),
    channel: 'phone',
    isAllowed: statusGenerator[1],
    log: [statusGenerator]
  };
  return faker.helpers.randomize([email, phone]) as ChannelStatusAttributes
}

function makeTemplate(options: Partial<TestDataMakerOptions>) {
  return {
    id: faker.datatype.uuid(),
    jurisdictionId: options.jurisdiction?.id,
    name: faker.helpers.randomize(TEMPLATE_NAMES),
    type: faker.helpers.randomize(TEMPLATE_TYPES),
    content: "Dummy template content"
  } as TemplateAttributes;
}

export async function writeTestDataToDatabase(databaseEngine: Sequelize, testData: TestDataPayload): Promise<void> {
  const {
    Jurisdiction,
    StaffUser,
    StaffUserDepartment,
    Service,
    ServiceRequest,
    ServiceRequestComment,
    Communication,
    Department,
    InboundMap,
    ChannelStatus,
    Template
  } = databaseEngine.models;

  for (const jurisdictionData of testData.jurisdictions) {
    await Jurisdiction.create(jurisdictionData);
  }

  for (const departmentData of testData.departments) {
    await Department.create(departmentData);
  }

  for (const staffUserData of testData.staffUsers) {
    await StaffUser.create(staffUserData) as unknown as StaffUserModel;
  }

  for (const staffUserDepartmentData of testData.staffUserDepartments) {
    await StaffUserDepartment.create(staffUserDepartmentData) as unknown as StaffUserDepartmentModel;
  }

  for (const serviceData of testData.services) {
    await Service.create(serviceData);
  }

  for (const serviceRequestData of testData.serviceRequests) {

    const record = await ServiceRequest.create(serviceRequestData) as ServiceRequestInstance;
    for (const comment of serviceRequestData.comments) {
      await ServiceRequestComment.create(Object.assign({}, comment, { serviceRequestId: record.id }))
    }
    await InboundMap.create({
      id: record.id.replaceAll('-', ''),
      jurisdictionId: record.jurisdictionId,
      serviceRequestId: record.id,
    })
  }

  for (const communicationData of testData.communications) {
    await Communication.create(communicationData);
  }

  for (const inboundMapData of testData.inboundMaps) {
    await InboundMap.create(inboundMapData);
  }

  for (const channelStatusData of testData.channelStatuses) {
    await ChannelStatus.create(channelStatusData);
  }

  for (const templateData of testData.templates) {
    await Template.create(templateData);
  }

}

export default function makeTestData(): TestDataPayload {
  const jurisdictions = factory(makeJurisdiction, 3, {}) as unknown as JurisdictionAttributes[];
  let staffUsers: StaffUserAttributes[] = [];
  let staffUserDepartments: StaffUserDepartmentAttributes[] = [];
  let services: ServiceAttributes[] = [];
  let serviceRequests: ServiceRequestAttributes[] = [];
  let communications: CommunicationAttributes[] = [];
  let departments: DepartmentAttributes[] = [];
  let inboundMaps: InboundMapAttributes[] = [];
  let channelStatuses: ChannelStatusAttributes[] = [];
  let templates: TemplateAttributes[] = [];

  // we want some jurisdictions to enforce assignment through department
  jurisdictions[2].enforceAssignmentThroughDepartment = true

  for (const jurisdiction of jurisdictions) {
    staffUsers = staffUsers.concat(
      factory(
        makeStaffUser, 20, { jurisdiction }
      ) as unknown as StaffUserAttributes[])
    services = services.concat(factory(makeService, 5, { jurisdiction }) as unknown as ServiceAttributes[])
    departments = departments.concat(
      factory(makeDepartment, 20, { jurisdiction }) as unknown as DepartmentAttributes[]
    )
    serviceRequests = serviceRequests.concat(
      factory(
        makeServiceRequest, 20, { staffUsers, services, jurisdiction, departments }
      ) as unknown as ServiceRequestAttributes[]
    )
    const _inboundEmailMaps = factory(
      makeInboundMap, 3, { jurisdiction, departments, opts: { channel: 'email' } }
    ) as unknown as InboundMapAttributes[]
    const _inboundSmsMaps = factory(
      makeInboundMap, 3, { jurisdiction, departments, opts: { channel: 'sms' } }
    ) as unknown as InboundMapAttributes[]
    inboundMaps = [..._inboundEmailMaps, ..._inboundSmsMaps];
    staffUserDepartments = makeStaffUserDepartments(staffUsers, departments);
    templates = templates.concat(
      factory(makeTemplate, 5, { jurisdiction }) as unknown as TemplateAttributes[]
    )
  }

  for (const serviceRequest of serviceRequests) {
    communications = communications.concat(
      factory(makeCommunication, 10, { serviceRequest }) as unknown as CommunicationAttributes[]
    )
  }

  channelStatuses = factory(makeChannelStatus, 100, {}) as unknown as ChannelStatusAttributes[];

  return {
    jurisdictions,
    staffUsers,
    staffUserDepartments,
    services,
    serviceRequests,
    communications,
    departments,
    inboundMaps,
    channelStatuses,
    templates
  }
}
