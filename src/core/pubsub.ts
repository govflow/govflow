import { EventEmitter } from 'events';
import logger from '../logging';
import { serviceRequestCreateHandler, serviceRequestDataChangeHandler } from './communications/event-handlers';

export const GovFlowPubSub = new EventEmitter();

GovFlowPubSub.on('serviceRequestCreate', async (serviceRequest) => {
    logger.info('Responding to serviceRequestCreate event.');
    try {
        await serviceRequestCreateHandler(serviceRequest);
    } catch (error) {
        throw error;
    }
});

GovFlowPubSub.on('serviceRequestDataChange', async (serviceRequest, changedData) => {
    logger.info('Responding to serviceRequestDataChange event.');
    try {
        await serviceRequestDataChangeHandler(serviceRequest, changedData);
    } catch (error) {
        throw error;
    }
});
