import faker from 'faker';
import type { Sequelize } from 'sequelize/types';

function factory(generator: Function, times: number, generatorOpts: {}) {
    const iterations = [...Array(times).keys()];
    let data: Record<string, unknown>[] = [];
    iterations.forEach(() => {
        data.push(generator(generatorOpts))
    })
    return data;
}

function makeClient() {
    return {
        id: faker.datatype.uuid(),
        jurisdictionId: faker.datatype.uuid(),
    }
}

function makeStaffUser(options: Record<string, unknown>) {
    return {
        id: faker.datatype.uuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber(),
        // @ts-ignore
        clientId: options.client.id,
    }
}

function makeService(options: Record<string, unknown>) {
    return {
        id: faker.datatype.uuid(),
        name: faker.datatype.string(),
        description: faker.lorem.sentences(5),
        tags: [faker.datatype.string(), faker.datatype.string()],
        type: faker.helpers.randomize(['realtime', 'batch', 'blackbox']),
        // @ts-ignore
        clientId: options.client.id,
    }
}

function makeServiceRequest(options: Record<string, Record<string, unknown>>) {
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
        // @ts-ignore
        assignedTo: faker.helpers.randomize(options.staffUsers.map((u) => { return u.id })),
        // @ts-ignore
        serviceId: faker.helpers.randomize(options.services.map((s) => { return s.id })),
        // @ts-ignore
        clientId: options.client.id,
        comments: [makeServiceRequestComment(), makeServiceRequestComment()]
    }
}

function makeServiceRequestComment() {
    return {
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
        clientId: options.client.id,
    }
}

export async function writeTestDataToDatabase(databaseEngine: Sequelize, testData: Record<string, Record<string, unknown>[]>) {
    const { Client, StaffUser, Service, ServiceRequest, ServiceRequestComment, Event } = databaseEngine.models;

    for (const clientData of testData.clients) {
        await Client.create(clientData);
    }

    for (const staffUserData of testData.staffUsers) {
        await StaffUser.create(staffUserData);
    }

    for (const serviceData of testData.services) {
        await Service.create(serviceData);
    }

    for (const serviceRequestData of testData.serviceRequests) {
        const record = await ServiceRequest.create(serviceRequestData);
        //@ts-ignore
        for (const comment of serviceRequestData.comments) {
            //@ts-ignore
            await ServiceRequestComment.create(Object.assign({}, comment, { serviceRequestId: record.id }))
        }
    }

    for (const eventData of testData.events) {
        await Event.create(eventData);
    }
}

export default function makeTestData(): Record<string, Record<string, unknown>[]> {
    const clients = factory(makeClient, 3, {});
    let staffUsers: Record<string, unknown>[] = [];
    let services: Record<string, unknown>[] = [];
    let serviceRequests: Record<string, unknown>[] = [];
    let events: Record<string, unknown>[] = [];

    for (const client of clients) {
        staffUsers = staffUsers.concat(factory(makeStaffUser, 3, { client }))
        services = services.concat(factory(makeService, 5, { client }))
        serviceRequests = serviceRequests.concat(factory(makeServiceRequest, 20, { staffUsers, services, client }))
        events = events.concat(factory(makeEvent, 20, { client }))
    }

    return {
        clients,
        staffUsers,
        services,
        serviceRequests,
        events
    }
}
