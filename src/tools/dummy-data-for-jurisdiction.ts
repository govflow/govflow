import { Application } from 'express';
import faker from 'faker';
import { ServiceAttributes, ServiceRequestAttributes, ServiceRequestCreateAttributes } from '../types';
// eslint-disable-next-line
const GOVFLOW_DUMMY_DATA_FOR_JURISDICTION_JURISDICTION_ID = process.env.GOVFLOW_DUMMY_DATA_FOR_JURISDICTION_JURISDICTION_ID || '';
// eslint-disable-next-line
const GOVFLOW_DUMMY_DATA_FOR_JURISDICTION_SUBMITTER_EMAIL_BASE = process.env.GOVFLOW_DUMMY_DATA_FOR_JURISDICTION_SUBMITTER_EMAIL_BASE || '';
const YEAR = 2022;
const RECORD_COUNT = 600; // always do 600 - need it for a simple calc in date ranges
const MONTHS = [3, 4, 5, 6, 7, 8]; // always do 6 - need it for a simple calc in date ranges
const OPEN_TICKET_WINDOWS = [1, 2, 3, 4, 5]; // always do 5 - need it for a simple calc in date ranges
const SERVICE_REQUEST_STATUS = 'done';

interface ServiceSeedData {
  name: string;
  group: string;
  jurisdictionId: string;
}

function makeService(data: ServiceSeedData) {
  return {
    id: data.name.toLowerCase().replace(' ', '-'),
    group: data.group,
    name: data.name,
    description: faker.lorem.sentences(5),
    tags: [faker.datatype.string(), faker.datatype.string()],
    type: faker.helpers.randomize(['realtime', 'batch', 'blackbox']),
    jurisdictionId: data.jurisdictionId,
  } as ServiceAttributes;
}

function makeServices(jurisdictionId: string) {
  const serviceNames = [
    { jurisdictionId: jurisdictionId, name: 'Pothole', group: 'Road repairs' },
    { jurisdictionId: jurisdictionId, name: 'Fallen tree damage', group: 'Road repairs' },
    { jurisdictionId: jurisdictionId, name: 'Abandoned vehicle', group: 'Illegal Parking' },
    { jurisdictionId: jurisdictionId, name: 'Access blocked', group: 'Illegal Parking' },
    { jurisdictionId: jurisdictionId, name: 'Stray dog', group: 'Animal complaints' },
    { jurisdictionId: jurisdictionId, name: 'Stray cat', group: 'Animal complaints' },
    { jurisdictionId: jurisdictionId, name: 'Leaking hydrant', group: 'Water repairs' },
    { jurisdictionId: jurisdictionId, name: 'Burst mains', group: 'Water repairs' },
    { jurisdictionId: jurisdictionId, name: 'Graffiti removal', group: 'Public spaces' },
    { jurisdictionId: jurisdictionId, name: 'Dumped rubbish', group: 'Public spaces' },
    { jurisdictionId: jurisdictionId, name: 'Missed garbage pickup', group: 'Garbage collection' },
    { jurisdictionId: jurisdictionId, name: 'Overflowing garbage', group: 'Garbage collection' },
  ] as ServiceSeedData[]
  return serviceNames.map(makeService)
}

interface SubmitterSeedData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

function makeSubmitter() {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: GOVFLOW_DUMMY_DATA_FOR_JURISDICTION_SUBMITTER_EMAIL_BASE.replace(
      '{{id}}',
      faker.random.alpha({ count: 7, upcase: false }).toLowerCase()
    ),
    phone: faker.phone.phoneNumber(),
  } as SubmitterSeedData;
}

function makeSubmitters() {
  return Array(RECORD_COUNT).fill({}).map(makeSubmitter)
}

function makeServiceRequest(
  jurisdictionId: string, submitter: SubmitterSeedData, service: ServiceAttributes, dateRange: DateRange
) {
  return {
    serviceId: service.id,
    jurisdictionId: jurisdictionId,
    description: faker.lorem.sentences(5),
    firstName: submitter.firstName,
    lastName: submitter.lastName,
    email: submitter.email,
    phone: submitter.phone,
    status: SERVICE_REQUEST_STATUS,
    createdAt: dateRange.submit,
    updatedAt: dateRange.close,
    closeDate: dateRange.close,
  } as ServiceRequestCreateAttributes;
}

function makeServiceRequests(
  jurisdictionId: string, submitters: SubmitterSeedData[], services: ServiceAttributes[], dateRanges: DateRange[]
) {
  const serviceRequests: Partial<ServiceRequestAttributes>[] = [];
  for (const [i, submitter] of submitters.entries()) {
    const dateRange = dateRanges[i];
    const service = faker.helpers.randomize(services);
    serviceRequests.push(makeServiceRequest(jurisdictionId, submitter, service, dateRange))
  }
  return serviceRequests;
}

interface DateRangeSeedData {
  window: number;
  month: number;
  day: number
}

interface DateRange {
  submit: Date;
  close: Date;
}

function makeDateRange(data: DateRangeSeedData) {
  const submit = new Date(YEAR, data.month, data.day);
  const close = new Date(submit.getTime() + data.window * 24 * 60 * 60 * 1000);
  return {
    submit: submit,
    close: close
  }
}

function makeDateRanges() {
  const dateRanges = [];
  const perMonth = RECORD_COUNT / MONTHS.length;
  for (const month of MONTHS) {
    const windowLength = perMonth / OPEN_TICKET_WINDOWS.length;
    const windows = Array(windowLength).fill(OPEN_TICKET_WINDOWS).flat();
    const days = Array(windows.length).fill(faker.datatype.number({ 'min': 1, 'max': 28 }));
    const dateData = windows.map((e, i) => { return { window: e, month: month, day: days[i] } });
    dateRanges.push(...dateData.map(makeDateRange));
  }
  return dateRanges;
}

export async function run(app: Application) {
  const { serviceRepository, serviceRequestRepository } = app.repositories;
  const services = makeServices(GOVFLOW_DUMMY_DATA_FOR_JURISDICTION_JURISDICTION_ID);
  const submitters = makeSubmitters();
  const dateRanges = makeDateRanges();
  const serviceRequests = makeServiceRequests(
    GOVFLOW_DUMMY_DATA_FOR_JURISDICTION_JURISDICTION_ID, submitters, services, dateRanges
  );

  for (const service of services) {
    try {
      await serviceRepository.create(service);
    } catch (err) {
      console.log("ERROR CREATING SERVICE")
      console.log(err)
    }
  }

  for (const serviceRequest of serviceRequests) {
    try {
      await serviceRequestRepository.create(serviceRequest);
    } catch (err) {
      console.log("ERROR CREATING SERVICE REQUEST")
      console.log(err)
    }
  }

  const [allServiceRequests, serviceRequestCount] = await serviceRequestRepository.findAll(
    GOVFLOW_DUMMY_DATA_FOR_JURISDICTION_JURISDICTION_ID
  );
  console.log(serviceRequestCount);
  console.log(allServiceRequests.map(r => r.id));
}
