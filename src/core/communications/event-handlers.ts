import type { ICommunicationRepository, ServiceRequestAttributes } from '../../types';
import { SERVICE_REQUEST_CLOSED_STATES } from '../service-requests';

export async function serviceRequestCreateHandler(
    serviceRequest: ServiceRequestAttributes, CommunicationRepository: ICommunicationRepository
): Promise<void> {
    await CommunicationRepository.dispatchServiceRequestNew(serviceRequest);
}

export async function serviceRequestChangeHandler(
    serviceRequest: ServiceRequestAttributes,
    changedData: Record<string, unknown>,
    CommunicationRepository: ICommunicationRepository
): Promise<void> {
    for (const [key, value] of Object.entries(changedData)) {
        /* eslint-disable */
        // @ts-ignore
        if (serviceRequest[key] != value) {
            /* eslint-enable */
            if (key === 'status') {
                if (SERVICE_REQUEST_CLOSED_STATES.includes(value as string)) {
                    await CommunicationRepository.dispatchServiceRequestClosed(serviceRequest);
                } else {
                    await CommunicationRepository.dispatchServiceRequestChangedStatus(serviceRequest);
                }
            } else if (key === 'assignedTo') {
                await CommunicationRepository.dispatchServiceRequestChangedAssignee(serviceRequest);
            }
        }
    }
}
