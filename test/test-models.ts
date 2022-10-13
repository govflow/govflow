import chai from 'chai';
import type { Application } from 'express';
import { createApp } from '../src/index';
import makeTestData from '../src/tools/fake-data-generator';
import { ServiceRequestInstance, TestDataPayload } from '../src/types';

describe('Verify Core Models.', function () {

  let app: Application;
  let testData: TestDataPayload;

  before(async function () {
    app = await createApp();
    await app.migrator.up();
    testData = makeTestData();
  })

  after(async function () {
    await app.database.drop({});
  })

  it('should find all models', async function () {
    const { Jurisdiction, StaffUser, ServiceRequest, ServiceRequestComment, Service } = app.database.models;
    chai.assert(Jurisdiction);
    chai.assert(StaffUser);
    chai.assert(ServiceRequest);
    chai.assert(ServiceRequestComment);
    chai.assert(Service);
  });

  it('should write jurisdictions to database', async function () {
    const { Jurisdiction } = app.database.models;
    for (const jurisdictionData of testData.jurisdictions) {
      const record = await Jurisdiction.create(jurisdictionData);
      chai.assert(record);
    }
  });

  it('should write staff users to database', async function () {
    const { StaffUser } = app.database.models;
    for (const staffUserData of testData.staffUsers) {
      const record = await StaffUser.create(staffUserData);
      chai.assert(record);
    }
  });

  it('should write services to database', async function () {
    const { Service } = app.database.models;
    for (const serviceData of testData.services) {
      const record = await Service.create(serviceData);
      chai.assert(record);
    }
  });

  it('should write service requests to database', async function () {
    const { ServiceRequest } = app.database.models;
    for (const serviceRequestData of testData.serviceRequests) {
      const record = await ServiceRequest.create(serviceRequestData);
      chai.assert(record);
    }
  });

  it('should have generated public ids for service requests', async function () {
    const { ServiceRequest } = app.database.models;
    const records = await ServiceRequest.findAll() as ServiceRequestInstance[];

    for (const record of records) {
      chai.assert(record.publicId);
      chai.assert(record.idCounter);
    }
  });

  it('should write communications to database', async function () {
    const { Communication } = app.database.models;
    for (const communicationData of testData.communications) {
      const record = await Communication.create(communicationData);
      chai.assert(record);
    }
  });

  it('should write departments to database', async function () {
    const { Department } = app.database.models;
    for (const departmentData of testData.departments) {
      const record = await Department.create(departmentData);
      chai.assert(record);
    }
  });

  it('should write inbound maps to database', async function () {
    const { InboundMap } = app.database.models;
    for (const inboundMapData of testData.inboundMaps) {
      const record = await InboundMap.create(inboundMapData);
      chai.assert(record);
    }
  });

  it('should write channel statuses to database', async function () {
    const { ChannelStatus } = app.database.models;
    for (const channelStatusData of testData.channelStatuses) {
      const record = await ChannelStatus.create(channelStatusData);
      chai.assert(record);
    }
  });

});
