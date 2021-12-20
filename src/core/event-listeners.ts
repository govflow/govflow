import { EventEmitter } from 'events';
import logger from '../logging';
import {
    serviceRequestChangeAssignedToHandler,
    serviceRequestChangeStatusHandler,
    serviceRequestClosedHandler,
    serviceRequestCreateHandler
} from './communications/event-handlers';

export const GovFlowEmitter = new EventEmitter();

GovFlowEmitter.on('serviceRequestCreate', async (jurisdiction, serviceRequest, CommunicationRepository) => {
    logger.info('Responding to serviceRequestCreate event.');
    await serviceRequestCreateHandler(jurisdiction, serviceRequest, CommunicationRepository);
});

GovFlowEmitter.on('serviceRequestChangeStatus', async (jurisdiction, serviceRequest, CommunicationRepository) => {
    logger.info('Responding to serviceRequestChangeStatus event.');
    await serviceRequestChangeStatusHandler(jurisdiction, serviceRequest, CommunicationRepository);
});

GovFlowEmitter.on('serviceRequestChangeAssignedTo', async (jurisdiction, serviceRequest, CommunicationRepository) => {
    logger.info('Responding to serviceRequestChangeAssignedTo event.');
    await serviceRequestChangeAssignedToHandler(jurisdiction, serviceRequest, CommunicationRepository);
});

GovFlowEmitter.on('serviceRequestClosed', async (jurisdiction, serviceRequest, CommunicationRepository) => {
    logger.info('Responding to serviceRequestClosed event.');
    await serviceRequestClosedHandler(jurisdiction, serviceRequest, CommunicationRepository);
});