import type { ICommunicationRepository, IterableQueryResult, QueryResult } from "../../types";

export async function serviceRequestCreateHandler(
    serviceRequest: Record<string, unknown>, CommunicationRepository: ICommunicationRepository
): Promise<IterableQueryResult> {
    return await CommunicationRepository.dispatchForServiceRequestNew(serviceRequest);
}

export async function serviceRequestDataChangeHandler(
    serviceRequest: Record<string, unknown>,
    changedData: Record<string, unknown>,
    CommunicationRepository: ICommunicationRepository
): Promise<QueryResult> {

    for (const [key, value] of Object.entries(changedData)) {
        if (serviceRequest[key] != value) {
            if (key === 'status') {
                return await CommunicationRepository.dispatchForServiceRequestChangedStatus(serviceRequest);
            } else if (key === 'assignedTo') {
                return await CommunicationRepository.dispatchForServiceRequestChangedAssignee(serviceRequest);
            }
        }
    }
    // TODO: fix
    return null;
}
