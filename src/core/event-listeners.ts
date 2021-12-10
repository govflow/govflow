import { EventEmitter } from 'events';
import logger from '../logging';
import { serviceRequestChangeHandler, serviceRequestCreateHandler } from './communications/event-handlers';

export const GovFlowEmitter = new EventEmitter();

GovFlowEmitter.on('serviceRequestCreate', async (serviceRequest, CommunicationRepository) => {
    logger.info('Responding to serviceRequestCreate event.');
    await serviceRequestCreateHandler(serviceRequest, CommunicationRepository);
});

GovFlowEmitter.on('serviceRequestChange', async (serviceRequest, changedData, CommunicationRepository) => {
    logger.info('Responding to serviceRequestChange event.');
    await serviceRequestChangeHandler(serviceRequest, changedData, CommunicationRepository);
});
