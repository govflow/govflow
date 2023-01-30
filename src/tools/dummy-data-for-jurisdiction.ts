import { Application } from 'express';
import faker from 'faker';
import { ServiceAttributes, ServiceRequestAttributes, ServiceRequestCreateAttributes } from '../types';

interface ServiceTypeConfig {
  name: string;
  group: string;
  jurisdictionId?: string;
}

interface Config {
  jurisdiction_id: string;
  submitter_email_base: string;
  record_count: number;
  year: number;
  months: number[];
  service_types: ServiceTypeConfig[];
  open_ticket_windows: number[];
  trigger_status: string;
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

interface ServiceSeedData {
  name: string;
  group: string;
  jurisdictionId: string;
}

interface SubmitterSeedData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// here we load the config file for this dummy data run
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(process.env.GOVFLOW_DUMMY_DATA_CONFIG || '') as Config;

console.log("Loaded config:");
console.log(config);

let jurisdictionId = '';
let submitterEmailBase = '';
let year = 0;
let recordCount = 0;
let months: number[] = [];
let serviceData: ServiceTypeConfig[] = [];
let openTicketWindows: number[] = [];
let triggerStatus = 'done';

if (config) {
  jurisdictionId = config.jurisdiction_id;
  submitterEmailBase = config.submitter_email_base;
  year = config.year;
  recordCount = config.record_count; // always do 600 - need it for a simple calc in date ranges
  months = config.months; // must divide nicely into record count
  serviceData = config.service_types;
  openTicketWindows = config.open_ticket_windows;
  triggerStatus = config.trigger_status;
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
  const serviceNames = serviceData.map(
    i => Object.assign({}, i, {jurisdictionId})
  ) as ServiceSeedData[]
  return serviceNames.map(makeService)
}

function makeSubmitter() {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: submitterEmailBase.replace(
      '{{id}}',
      faker.random.alpha({ count: 7, upcase: false }).toLowerCase()
    ),
    phone: faker.phone.phoneNumber(),
  } as SubmitterSeedData;
}

function makeSubmitters() {
  return Array(recordCount).fill({}).map(makeSubmitter)
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
    status: triggerStatus,
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

function makeDateRange(data: DateRangeSeedData) {
  const submit = new Date(year, data.month, data.day);
  const close = new Date(submit.getTime() + data.window * 24 * 60 * 60 * 1000);
  return {
    submit: submit,
    close: close
  }
}

function makeDateRanges() {
  const dateRanges = [];
  const perMonth = recordCount / months.length;
  for (const month of months) {
    const windowLength = perMonth / openTicketWindows.length;
    const windows = Array(windowLength).fill(openTicketWindows).flat();
    const daysContainer = Array(windows.length).fill(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const days = daysContainer.map(e => faker.datatype.number({ 'min': 1, 'max': 28 }));
    const dateData = windows.map((e, i) => { return { window: e, month: month, day: days[i] } });
    dateRanges.push(...dateData.map(makeDateRange));
  }
  return dateRanges;
}

export async function run(app: Application) {

  if (!config) return "Run failed: no config file supplied"

  const { serviceRepository, serviceRequestRepository } = app.repositories;

  const [_existing, existingServiceRequestCount] = await serviceRequestRepository.findAll(jurisdictionId);

  const services = makeServices(jurisdictionId);
  const submitters = makeSubmitters();
  const dateRanges = makeDateRanges();
  const serviceRequests = makeServiceRequests(
    jurisdictionId, submitters, services, dateRanges
  );

  for (const service of services) {
    try {
      await serviceRepository.create(service);
    } catch (err) {
      // it can be normal for this to error if the services exist
      console.log("ERROR CREATING SERVICE")
      console.log(err)
    }
  }

  for (const serviceRequest of serviceRequests) {
    try {
      await serviceRequestRepository.create(serviceRequest);
      console.log(serviceRequest.createdAt, serviceRequest.updatedAt, serviceRequest.closeDate);
    } catch (err) {
      console.log("ERROR CREATING SERVICE REQUEST")
      console.log(err)
    }
  }

  // UNCOMMENT TO START AGAIN by deleting all service requests in a table
  // const [requests, _count] = await serviceRequestRepository.findAll(jurisdictionId);
  // console.log(jurisdictionId)
  // console.log(_count)
  // for (const r of requests) {
  //   // @ts-ignore
  //   await r.destroy();
  // }

  const [_serviceRequests, serviceRequestCount] = await serviceRequestRepository.findAll(jurisdictionId);
  console.log(`Counted ${existingServiceRequestCount} Service Requests BEFORE this dummy load`);
  console.log(`Counted ${serviceRequestCount} Service Requests AFTER this dummy load`);
}
