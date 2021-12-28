import { EventEmitter } from 'events';
import logger from '../logging';
import {
    serviceRequestChangeAssignedToHandler,
    serviceRequestChangeStatusHandler,
    serviceRequestClosedHandler,
    serviceRequestCreateHandler
} from './communications/event-handlers';

export const GovFlowEmitter = new EventEmitter();

GovFlowEmitter.on('serviceRequestCreate', async (jurisdiction, serviceRequest, dispatchHandler) => {
    logger.info('Responding to serviceRequestCreate event.');
    await serviceRequestCreateHandler(jurisdiction, serviceRequest, dispatchHandler);
});

GovFlowEmitter.on('serviceRequestChangeStatus', async (jurisdiction, serviceRequest, dispatchHandler) => {
    logger.info('Responding to serviceRequestChangeStatus event.');
    await serviceRequestChangeStatusHandler(jurisdiction, serviceRequest, dispatchHandler);
});

GovFlowEmitter.on('serviceRequestChangeAssignedTo', async (jurisdiction, serviceRequest, dispatchHandler) => {
    logger.info('Responding to serviceRequestChangeAssignedTo event.');
    await serviceRequestChangeAssignedToHandler(jurisdiction, serviceRequest, dispatchHandler);
});

GovFlowEmitter.on('serviceRequestClosed', async (jurisdiction, serviceRequest, dispatchHandler) => {
    logger.info('Responding to serviceRequestClosed event.');
    await serviceRequestClosedHandler(jurisdiction, serviceRequest, dispatchHandler);
});
