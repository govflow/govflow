import faker from 'faker';
import type { Sequelize } from 'sequelize/types';
import { REQUEST_STATUS_KEYS } from '../core/service-requests';
import { STAFF_USER_PERMISSIONS } from '../core/staff-users';
import { CommunicationAttributes, DepartmentAttributes, EventAttributes, JurisdictionAttributes, ServiceAttributes, ServiceRequestAttributes, ServiceRequestCommentAttributes, StaffUserAttributes, TestDataMakerOptions, TestDataPayload } from '../types';

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
        /* eslint-disable */
        // @ts-ignore
        jurisdictionId: options.jurisdiction.id,
        /* eslint-enable */
        permissions: STAFF_USER_PERMISSIONS,
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
        /* eslint-disable */
        // @ts-ignore
        jurisdictionId: options.jurisdiction.id,
        /* eslint-enable */
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
        images: [faker.image.imageUrl(), faker.image.imageUrl()],
        status: faker.helpers.randomize(REQUEST_STATUS_KEYS),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.helpers.randomize([null, faker.internet.email()]),
        phone: faker.helpers.randomize([null, faker.phone.phoneNumber()]),
        createdAt: faker.helpers.randomize(dates),
        updatedAt: faker.helpers.randomize(dates),
        inputChannel: 'webform',
        /* eslint-disable */
        // @ts-ignore
        assignedTo: faker.helpers.randomize(options.staffUsers.map((u) => { return u.id })),
        // @ts-ignore
        serviceId: faker.helpers.randomize(options.services.map((s) => { return s.id })),
        // @ts-ignore
        jurisdictionId: options.jurisdiction.id,
        /* eslint-enable */
        comments: [makeServiceRequestComment(), makeServiceRequestComment()]
    } as Partial<ServiceRequestAttributes>;
}

function makeServiceRequestComment() {
    return {
        id: faker.datatype.uuid(),
        comment: faker.lorem.sentences(5),
    } as ServiceRequestCommentAttributes
}

function makeEvent(options: Partial<TestDataMakerOptions>) {
    return {
        id: faker.datatype.uuid(),
        sender: {
            id: faker.datatype.uuid(),
            name: faker.datatype.string(),
            type: faker.datatype.string()
        },
        message: faker.lorem.sentences(3),
        actor: {
            id: faker.datatype.uuid(),
            name: faker.datatype.string(),
            type: faker.datatype.string()
        },
        jurisdictionId: options.jurisdiction?.id,
    } as EventAttributes
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

export async function writeTestDataToDatabase(databaseEngine: Sequelize, testData: TestDataPayload): Promise<void> {
    const {
        Jurisdiction,
        StaffUser,
        Service,
        ServiceRequest,
        ServiceRequestComment,
        Event,
        Communication,
        Department
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
        const record = await ServiceRequest.create(serviceRequestData);
        /* eslint-disable */
        //@ts-ignore
        for (const comment of serviceRequestData.comments) {
            //@ts-ignore
            await ServiceRequestComment.create(Object.assign({}, comment, { serviceRequestId: record.id }))
            /* eslint-enable */
        }
    }

    for (const eventData of testData.events) {
        await Event.create(eventData);
    }

    for (const communicationData of testData.communications) {
        await Communication.create(communicationData);
    }

    for (const departmentData of testData.departments) {
        await Department.create(departmentData);
    }

}

export default function makeTestData(): TestDataPayload {
    const jurisdictions = factory(makeJurisdiction, 3, {}) as unknown as JurisdictionAttributes[];
    let staffUsers: StaffUserAttributes[] = [];
    let services: ServiceAttributes[] = [];
    let serviceRequests: ServiceRequestAttributes[] = [];
    let events: EventAttributes[] = [];
    let communications: CommunicationAttributes[] = [];
    let departments: DepartmentAttributes[] = [];

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
        events = events.concat(factory(makeEvent, 20, { jurisdiction }) as unknown as EventAttributes[])
        departments = departments.concat(
            factory(makeDepartment, 20, { jurisdiction }) as unknown as DepartmentAttributes[]
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
        events,
        communications,
        departments
    }
}
