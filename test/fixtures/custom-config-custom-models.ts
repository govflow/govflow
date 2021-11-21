import { MyBlogPostModel, MyServiceModel } from '../fixtures/models';

export const models = [MyServiceModel, MyBlogPostModel];

export const settings = {
    'databaseExtraMigrationPaths': 'test/fixtures/test-migrations/*.ts'
};
