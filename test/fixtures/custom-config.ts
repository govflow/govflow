import { MyServiceRepositoryPlugin } from './repositories';

export const plugins = [MyServiceRepositoryPlugin];

export const settings = {
    'myKey': 'myValue',
    // 'databaseUrl': 'postgres://me:me@localhost:5432/govflow',
    'appPort': 9000
};
