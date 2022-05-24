import { AppConfig } from '../../src/types';
import { MyBlogPostModel, MyServiceModel } from '../fixtures/models';

export const config = {
    'plugins': {
        'models': [MyServiceModel, MyBlogPostModel],
        'migrations': [{ pathPattern: 'test/fixtures/test-migrations/*.ts' }]
    }
} as Partial<AppConfig>;
