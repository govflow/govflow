import type { IOutboundMessageService, JurisdictionAttributes, ServiceRequestAttributes, ServiceRequestCommentAttributes } from '../../types';

export async function serviceRequestCreateHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    dispatchHandler: IOutboundMessageService
): Promise<void> {
    await dispatchHandler.dispatchServiceRequestCreate(jurisdiction, serviceRequest);
}

export async function serviceRequestChangeStatusHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    dispatchHandler: IOutboundMessageService
): Promise<void> {
    await dispatchHandler.dispatchServiceRequestChangeStatus(jurisdiction, serviceRequest);
}

export async function serviceRequestChangeAssignedToHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    dispatchHandler: IOutboundMessageService
): Promise<void> {
    await dispatchHandler.dispatchServiceRequestChangeAssignee(jurisdiction, serviceRequest);
}

export async function serviceRequestClosedHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    dispatchHandler: IOutboundMessageService
): Promise<void> {
    await dispatchHandler.dispatchServiceRequestClosed(jurisdiction, serviceRequest);
}

export async function serviceRequestCommentBroadcastHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequestComment: ServiceRequestCommentAttributes,
    dispatchHandler: IOutboundMessageService
): Promise<void> {
    await dispatchHandler.dispatchServiceRequestComment(jurisdiction, serviceRequestComment);
}
