import type { ICommunicationRepository, JurisdictionAttributes, ServiceRequestAttributes } from '../../types';

export async function serviceRequestCreateHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    CommunicationRepository: ICommunicationRepository
): Promise<void> {
    await CommunicationRepository.dispatchServiceRequestCreate(jurisdiction, serviceRequest);
}

export async function serviceRequestChangeStatusHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    CommunicationRepository: ICommunicationRepository
): Promise<void> {
    await CommunicationRepository.dispatchServiceRequestChangeStatus(jurisdiction, serviceRequest);
}

export async function serviceRequestChangeAssignedToHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    CommunicationRepository: ICommunicationRepository
): Promise<void> {
    await CommunicationRepository.dispatchServiceRequestChangeAssignee(jurisdiction, serviceRequest);
}

export async function serviceRequestClosedHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    CommunicationRepository: ICommunicationRepository
): Promise<void> {
    await CommunicationRepository.dispatchServiceRequestClosed(jurisdiction, serviceRequest);
}
