import { EventEmitter } from 'events';
import logger from '../logging';
import { serviceRequestCreateHandler, serviceRequestDataChangeHandler } from './communications/event-handlers';

export const GovFlowPubSub = new EventEmitter();

GovFlowPubSub.on('serviceRequestCreate', async (serviceRequest, CommunicationRepository) => {
    logger.info('Responding to serviceRequestCreate event.');
    try {
        await serviceRequestCreateHandler(serviceRequest, CommunicationRepository);
    } catch (error) {
        throw error;
    }
});

GovFlowPubSub.on('serviceRequestDataChange', async (serviceRequest, changedData, CommunicationRepository) => {
    logger.info('Responding to serviceRequestDataChange event.');
    try {
        await serviceRequestDataChangeHandler(serviceRequest, changedData, CommunicationRepository);
    } catch (error) {
        throw error;
    }
});
