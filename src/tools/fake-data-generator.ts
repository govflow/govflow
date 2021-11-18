import faker from 'faker';
import type { Sequelize } from 'sequelize/types';

/* eslint-disable @typescript-eslint/ban-types */
function factory(generator: Function, times: number, generatorOpts: {}) {
    const iterations = [...Array(times).keys()];
    const data: Record<string, unknown>[] = [];
    iterations.forEach(() => {
        data.push(generator(generatorOpts))
    })
    return data;
}
/* eslint-enable @typescript-eslint/ban-types */

function makeJurisdiction() {
    return {
        id: faker.datatype.uuid(),
    }
}

function makeStaffUser(options: Record<string, Record<string, unknown>>) {
    return {
        id: faker.datatype.uuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber(),
        jurisdictionId: options.jurisdiction.id,
    }
}

function makeService(options: Record<string, Record<string, unknown>>) {
    return {
        id: faker.datatype.uuid(),
        name: faker.datatype.string(),
        description: faker.lorem.sentences(5),
        tags: [faker.datatype.string(), faker.datatype.string()],
        type: faker.helpers.randomize(['realtime', 'batch', 'blackbox']),
        jurisdictionId: options.jurisdiction.id,
    }
}

function makeServiceRequest(options: Record<string, Record<string, unknown>>) {
    const dates = [
        new Date('2021-11-01T00:00:00.000Z'),
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
        images: [faker.image.imageUrl(), faker.image.imageUrl()],
        status: faker.helpers.randomize(['inbox', 'todo', 'doing', 'blocked', 'done']),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber(),
        createdAt: faker.helpers.randomize(dates),
        updatedAt: faker.helpers.randomize(dates),
        /* eslint-disable */
        // @ts-ignore
        assignedTo: faker.helpers.randomize(options.staffUsers.map((u) => { return u.id })),
        // @ts-ignore
        serviceId: faker.helpers.randomize(options.services.map((s) => { return s.id })),
        // @ts-ignore
        jurisdictionId: options.jurisdiction.id,
        /* eslint-enable */
        comments: [makeServiceRequestComment(), makeServiceRequestComment()]
    }
}

function makeServiceRequestComment() {
    return {
        id: faker.datatype.uuid(),
        comment: faker.lorem.sentences(5),
    }
}

function makeEvent(options: Record<string, Record<string, unknown>>) {
    return {
        id: faker.datatype.uuid(),
        sender: faker.datatype.string(),
        message: faker.lorem.sentences(3),
        actor: {
            id: faker.datatype.uuid(),
            name: faker.datatype.string(),
            type: faker.datatype.string()
        },
        jurisdictionId: options.jurisdiction.id,
    }
}

export async function writeTestDataToDatabase(databaseEngine: Sequelize, testData: Record<string, Record<string, unknown>[]>): Promise<void> {
    const { Jurisdiction, StaffUser, Service, ServiceRequest, ServiceRequestComment, Event } = databaseEngine.models;

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
}

export default function makeTestData(): Record<string, Record<string, unknown>[]> {
    const jurisdictions = factory(makeJurisdiction, 3, {});
    let staffUsers: Record<string, unknown>[] = [];
    let services: Record<string, unknown>[] = [];
    let serviceRequests: Record<string, unknown>[] = [];
    let events: Record<string, unknown>[] = [];

    for (const jurisdiction of jurisdictions) {
        staffUsers = staffUsers.concat(factory(makeStaffUser, 3, { jurisdiction }))
        services = services.concat(factory(makeService, 5, { jurisdiction }))
        serviceRequests = serviceRequests.concat(factory(makeServiceRequest, 20, { staffUsers, services, jurisdiction }))
        events = events.concat(factory(makeEvent, 20, { jurisdiction }))
    }

    return {
        jurisdictions,
        staffUsers,
        services,
        serviceRequests,
        events
    }
}
