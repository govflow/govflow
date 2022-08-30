import Emittery from 'emittery';
import { inject, injectable } from 'inversify';
import logger from '../logging';
import { appIds } from '../registry/service-identifiers';
import { HookData, HookDataExtraData, IOutboundMessageService, IServiceRequestHookRunner, JurisdictionAttributes, ServiceRequestAttributes } from '../types';
import {
    cxSurveyHandler,
    serviceRequestChangeAssignedToHandler,
    serviceRequestChangeStatusHandler,
    serviceRequestClosedHandler, serviceRequestCommentBroadcastHandler, serviceRequestCreateHandler
} from './communications/event-handlers';

class ServiceRequestLifecycleEmitter extends Emittery { }

export const serviceRequestLifecycleEmitter = new ServiceRequestLifecycleEmitter();

serviceRequestLifecycleEmitter.on('serviceRequestCreate', async (data: HookData) => {
    logger.info('Responding to serviceRequestCreate event.');
    const { jurisdiction, record, dispatchHandler } = data;
    await serviceRequestCreateHandler(jurisdiction, record, dispatchHandler);
    await cxSurveyHandler(jurisdiction, record, dispatchHandler);
});

serviceRequestLifecycleEmitter.on('serviceRequestChangeStatus', async (data: HookData) => {
    logger.info('Responding to serviceRequestChangeStatus event.');
    const { jurisdiction, record, dispatchHandler } = data;
    await serviceRequestChangeStatusHandler(jurisdiction, record, dispatchHandler);
    await cxSurveyHandler(jurisdiction, record, dispatchHandler);
});

serviceRequestLifecycleEmitter.on('serviceRequestChangeAssignedTo', async (data: HookData) => {
    logger.info('Responding to serviceRequestChangeAssignedTo event.');
    const { jurisdiction, record, dispatchHandler } = data;
    await serviceRequestChangeAssignedToHandler(jurisdiction, record, dispatchHandler);
});

serviceRequestLifecycleEmitter.on('serviceRequestClosed', async (data: HookData) => {
    logger.info('Responding to serviceRequestClosed event.');
    const { jurisdiction, record, dispatchHandler } = data;
    await serviceRequestClosedHandler(jurisdiction, record, dispatchHandler);
    await cxSurveyHandler(jurisdiction, record, dispatchHandler);
});

serviceRequestLifecycleEmitter.on('serviceRequestCommentBroadcast', async (data: HookData) => {
    logger.info('Responding to serviceRequestCommentBroadcast event.');
    const { jurisdiction, record, dispatchHandler, extraData } = data;
    await serviceRequestCommentBroadcastHandler(jurisdiction, record, dispatchHandler, extraData as HookDataExtraData);
});

@injectable()
export class ServiceRequestHookRunner implements IServiceRequestHookRunner {

    dispatchHandler: IOutboundMessageService
    emitter: ServiceRequestLifecycleEmitter

    constructor(
        @inject(appIds.OutboundMessageService) dispatchHandler: IOutboundMessageService,
    ) {
        this.emitter = serviceRequestLifecycleEmitter;
        this.dispatchHandler = dispatchHandler;
    }

    async run(
        hookName: string,
        jurisdiction: JurisdictionAttributes,
        record: ServiceRequestAttributes,
        extraData?: HookDataExtraData
    ): Promise<void> {
        await serviceRequestLifecycleEmitter.emit(
            hookName, { jurisdiction, record, dispatchHandler: this.dispatchHandler, extraData }
        );
    }
}
