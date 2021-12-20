export interface Open311Service {
    service_code: string;
    service_name: string;
    description?: string;
    metadata: boolean;
    type: 'realtime' | 'batch' | 'blackbox';
    keywords?: string[];
    group: string;
}

export interface Open311ServiceRequest {
    service_request_id: string;
    status: 'open' | 'closed';
    status_notes?: string;
    service_name: string;
    service_code: string;
    description: string;
    agency_responsible?: string;
    service_notice?: string;
    requested_datetime: string; // Returned in w3 format, eg 2010-01-01T00:00:00Z
    updated_datetime: string; // Returned in w3 format, eg 2010-01-01T00:00:00Z
    expected_datetime?: string;
    address: string;
    address_id: string;
    zipcode: string;
    lat: number;
    long: number;
    media_url: string;
}

export interface Open311ServiceRequestCreatePayload {
    jurisdiction_id: string;
    service_code: string;
    lat?: number;
    long?: number;
    address_string?: string;
    address_id?: string;
    email?: string;
    device_id?: string;
    account_id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    description?: string;
    media_url?: string;
}

export interface Open311ServiceRequestCreateResponseItem {
    service_request_id: string;
    service_notice?: string;
    account_id?: string;
}
