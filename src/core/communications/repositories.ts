import { injectable } from 'inversify';
import type { ICommunicationRepository } from '../../types';

@injectable()
export class CommunicationRepository implements ICommunicationRepository {

    async dispatch(): Promise<void> {
        return;
    }

}