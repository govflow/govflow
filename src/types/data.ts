export interface JurisdictionAttributes {
    id: string;
}

export interface StaffUserAttributes {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    jurisdictionId: string;
    email: string;
    permissions: string[],
}

export interface StaffUserLookUpAttributes {
    id: string;
    displayName: string;
    jurisdictionId: string;
    email: string;
}

export interface ServiceAttributes {
    id: string;
    name: string;
    group: string;
    jurisdictionId: string;
}

export interface ServiceRequestAttributes {
    id: string;
    serviceId?: string;
    jurisdictionId: string;
    description: string;
    address: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    assignedTo: string;
    createdAt: Date;
    updatedAt: Date;
    images: string[];
    lat: number;
    lon: number;
    inputChannel: string;
    communicationChannel: string;
    communicationValid: boolean;
    displayName: string;
    departmentId: string;
}

export interface ServiceRequestCommentAttributes {
    id: string;
    comment: string;
    actor: Record<string, string>;
    serviceRequestId: string,
}

export interface EventAttributes {
    id: string;
    sender: Record<string, string>;
    actor: Record<string, string>;
    message: string;
    jurisdictionId: string;
}

export interface CommunicationAttributes {
    id: string;
    channel: string;
    dispatched: boolean;
    dispatchPayload: Record<string, string>;
    dispatchResponse: Record<string, string>;
    accepted: boolean;
    delivered: boolean;
    serviceRequestId: string;
}

export interface DepartmentAttributes {
    id: string;
    name: string;
    jurisdictionId: string;
}

// export interface Open311ServiceAttributes {
//     service_code: string;
//     service_name: string;
//     description?: string;
//     metadata: boolean;
//     type: 'realtime' | 'batch' | 'blackbox';
//     keywords?: string[];
//     group: string;
// }

// export interface Open311ServiceRequestAttributes {
//     service_request_id: string;
//     status: 'open' | 'closed';
//     status_notes?: string;
//     service_name: string;
//     service_code: string;
//     description: string;
//     agency_responsible?: string;
//     service_notice?: string;
//     requested_datetime: string; // Returned in w3 format, eg 2010-01-01T00:00:00Z
//     updated_datetime: string; // Returned in w3 format, eg 2010-01-01T00:00:00Z
//     expected_datetime?: string;
//     address: string;
//     address_id: string;
//     zipcode: string;
//     lat: number;
//     long: number;
//     media_url: string;
// }

// export interface Open311ServiceRequestCreatePayload {
//     jurisdiction_id: string;
//     service_code: string;
//     lat?: number;
//     long?: number;
//     address_string?: string;
//     address_id?: string;
//     email?: string;
//     device_id?: string;
//     account_id?: string;
//     first_name?: string;
//     last_name?: string;
//     phone?: string;
//     description?: string;
//     media_url?: string;
// }

// export interface Open311ServiceRequestCreateResponseItem {
//     service_request_id: string;
//     service_notice?: string;
//     account_id?: string;
// }

export interface TestDataPayload {
    jurisdictions: JurisdictionAttributes[],
    staffUsers: StaffUserAttributes[],
    services: ServiceAttributes[],
    serviceRequests: ServiceRequestAttributes[],
    events: EventAttributes[],
    communications: CommunicationAttributes[],
    departments: DepartmentAttributes[],
}

export interface TestDataMakerOptions {
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    jurisdictions: JurisdictionAttributes[],
    staffUsers: StaffUserAttributes[],
    services: ServiceAttributes[],
    serviceRequests: ServiceRequestAttributes[],
    events: EventAttributes[],
}
