import { Open311ServiceAttributes, Open311ServiceRequestAttributes, Open311ServiceRequestCreatePayload, ServiceAttributes, ServiceRequestAttributes } from '../../types';

export const toOpen311Service = (service: ServiceAttributes): Open311ServiceAttributes => ({
    service_code: service.id,
    service_name: service.name,
    metadata: false,
    type: 'realtime',
    group: service.group,
});

export const toOpen311ServiceRequest = (serviceRequest: ServiceRequestAttributes): Open311ServiceRequestAttributes => ({
    service_request_id: serviceRequest.id,
    description: serviceRequest.description,
    address: serviceRequest.address,
    status: serviceRequest.status === 'done' ? 'closed' : 'open',
    service_name: '', // TODO populate field and return service name
    service_code: serviceRequest.serviceId || '',
    requested_datetime: serviceRequest.createdAt.toISOString(),
    updated_datetime: serviceRequest.updatedAt.toISOString(),
    address_id: '',
    lat: serviceRequest.lat,
    long: serviceRequest.lon,
    zipcode: '',
    media_url: serviceRequest.images?.length > 0 ? serviceRequest.images[0] : '',
});

export const toGovflowServiceRequest = (payload: Open311ServiceRequestCreatePayload): Partial<ServiceRequestAttributes> => ({
    jurisdictionId: payload.jurisdiction_id,
    serviceId: payload.service_code,
    description: payload.description || '',
    address: payload.address_string || '',
    firstName: payload.first_name,
    lastName: payload.last_name,
    phone: payload.phone,
    email: payload.email,
    lat: payload.lat as number,
    lon: payload.long as number
});
