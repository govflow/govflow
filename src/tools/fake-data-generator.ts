import faker from 'faker';
import type { Sequelize } from 'sequelize/types';
import { REQUEST_STATUS_KEYS } from '../core/service-requests';
import { STAFF_USER_PERMISSIONS } from '../core/staff-users';
import { CommunicationAttributes, DepartmentAttributes, InboundMapAttributes, JurisdictionAttributes, ServiceAttributes, ServiceRequestAttributes, ServiceRequestCommentAttributes, ServiceRequestInstance, StaffUserAttributes, TestDataMakerOptions, TestDataPayload } from '../types';

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
    } as JurisdictionAttributes;
}

function makeStaffUser(options: Partial<TestDataMakerOptions>) {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
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
        email: faker.helpers.randomize([null, faker.internet.email()]),
        phone: faker.helpers.randomize([null, faker.phone.phoneNumber()]),
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
    return {
        id: faker.datatype.uuid(),
        channel: faker.helpers.randomize(['email', 'sms']),
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
    return {
        id: faker.datatype.uuid(),
        jurisdictionId: options.jurisdiction?.id,
        departmentId: faker.helpers.randomize(options.departments as DepartmentAttributes[]).id,
    } as InboundMapAttributes
}

export async function writeTestDataToDatabase(databaseEngine: Sequelize, testData: TestDataPayload): Promise<void> {
    const {
        Jurisdiction,
        StaffUser,
        Service,
        ServiceRequest,
        ServiceRequestComment,
        Communication,
        Department,
        InboundMap
    } = databaseEngine.models;

    for (const jurisdictionData of testData.jurisdictions) {
        await Jurisdiction.create(jurisdictionData);
    }

    for (const staffUserData of testData.staffUsers) {
        await StaffUser.create(staffUserData);
    }

    for (const serviceData of testData.services) {
        await Service.create(serviceData);
    }

    for (const serviceRequestData of testData.serviceRequests) {
        const record = await ServiceRequest.create(serviceRequestData) as ServiceRequestInstance;
        for (const comment of serviceRequestData.comments) {
            await ServiceRequestComment.create(Object.assign({}, comment, { serviceRequestId: record.id }))
        }
    }

    for (const communicationData of testData.communications) {
        await Communication.create(communicationData);
    }

    for (const departmentData of testData.departments) {
        await Department.create(departmentData);
    }

    for (const inboundMapData of testData.inboundMaps) {
        await InboundMap.create(inboundMapData);
    }

}

export default function makeTestData(): TestDataPayload {
    const jurisdictions = factory(makeJurisdiction, 3, {}) as unknown as JurisdictionAttributes[];
    let staffUsers: StaffUserAttributes[] = [];
    let services: ServiceAttributes[] = [];
    let serviceRequests: ServiceRequestAttributes[] = [];
    let communications: CommunicationAttributes[] = [];
    let departments: DepartmentAttributes[] = [];
    let inboundMaps: InboundMapAttributes[] = [];

    for (const jurisdiction of jurisdictions) {
        staffUsers = staffUsers.concat(
            factory(
                makeStaffUser, 3, { jurisdiction }
            ) as unknown as StaffUserAttributes[])
        services = services.concat(factory(makeService, 5, { jurisdiction }) as unknown as ServiceAttributes[])
        serviceRequests = serviceRequests.concat(
            factory(
                makeServiceRequest, 20, { staffUsers, services, jurisdiction }
            ) as unknown as ServiceRequestAttributes[]
        )
        departments = departments.concat(
            factory(makeDepartment, 20, { jurisdiction }) as unknown as DepartmentAttributes[]
        )
        inboundMaps = inboundMaps.concat(
            factory(makeInboundMap, 3, { jurisdiction, departments }) as unknown as InboundMapAttributes[]
        )

    }

    for (const serviceRequest of serviceRequests) {
        communications = communications.concat(
            factory(makeCommunication, 10, { serviceRequest }) as unknown as CommunicationAttributes[]
        )
    }

    return {
        jurisdictions,
        staffUsers,
        services,
        serviceRequests,
        communications,
        departments,
        inboundMaps
    }
}
