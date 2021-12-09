import type { ICommunicationRepository } from "../../types";

export async function serviceRequestCreateHandler(
    serviceRequest: Record<string, unknown>, CommunicationRepository: ICommunicationRepository
) {
    return await CommunicationRepository.dispatchForServiceRequestNew(serviceRequest);
}

export async function serviceRequestDataChangeHandler(
    serviceRequest: Record<string, unknown>, changedData: Record<string, unknown>, CommunicationRepository: ICommunicationRepository
) {
    for (const [key, value] of Object.entries(changedData)) {
        if (serviceRequest[key] != value) {
            if (key === 'status') {
                console.log("STATUS CHANGED")
                console.log(serviceRequest[key])
                console.log(value)
                await CommunicationRepository.dispatchForServiceRequestChangedStatus(serviceRequest);
            } else if (key === 'assignedTo') {
                console.log("ASSIGNED TO CHANGED")
                await CommunicationRepository.dispatchForServiceRequestChangedAssignee(serviceRequest);
            }
        }
    }
}
