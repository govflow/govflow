import Emittery from 'emittery';
import logger from '../logging';
import { HookData, HookDataExtraData } from '../types';
import {
    cxSurveyHandler,
    serviceRequestChangeAssignedToHandler,
    serviceRequestChangeStatusHandler,
    serviceRequestClosedHandler, serviceRequestCommentBroadcastHandler, serviceRequestCreateHandler
} from './communications/event-handlers';

class ServiceRequestLifecycleEmitter extends Emittery { }

export const serviceRequestEmitter = new ServiceRequestLifecycleEmitter();

serviceRequestEmitter.on('serviceRequestCreate', async (data: HookData) => {
    logger.info('Responding to serviceRequestCreate event.');
    const { jurisdiction, record, dispatchHandler } = data;
    await serviceRequestCreateHandler(jurisdiction, record, dispatchHandler);
    await cxSurveyHandler(jurisdiction, record, dispatchHandler);
});

serviceRequestEmitter.on('serviceRequestChangeStatus', async (data: HookData) => {
    logger.info('Responding to serviceRequestChangeStatus event.');
    const { jurisdiction, record, dispatchHandler } = data;
    await serviceRequestChangeStatusHandler(jurisdiction, record, dispatchHandler);
    await cxSurveyHandler(jurisdiction, record, dispatchHandler);
});

serviceRequestEmitter.on('serviceRequestChangeAssignedTo', async (data: HookData) => {
    logger.info('Responding to serviceRequestChangeAssignedTo event.');
    const { jurisdiction, record, dispatchHandler } = data;
    await serviceRequestChangeAssignedToHandler(jurisdiction, record, dispatchHandler);
});

serviceRequestEmitter.on('serviceRequestClosed', async (data: HookData) => {
    logger.info('Responding to serviceRequestClosed event.');
    const { jurisdiction, record, dispatchHandler } = data;
    await serviceRequestClosedHandler(jurisdiction, record, dispatchHandler);
    await cxSurveyHandler(jurisdiction, record, dispatchHandler);
});

serviceRequestEmitter.on('serviceRequestCommentBroadcast', async (data: HookData) => {
    logger.info('Responding to serviceRequestCommentBroadcast event.');
    const { jurisdiction, record, dispatchHandler, extraData } = data;
    await serviceRequestCommentBroadcastHandler(jurisdiction, record, dispatchHandler, extraData as HookDataExtraData);
});
