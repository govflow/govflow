import { AppConfig, PluginRegistry } from '../../src/types';
import { MyServiceRepositoryPlugin } from './repositories';

export const config = {
    'myKey': 'myValue',
    // 'databaseUrl': 'postgres://me:me@localhost:5432/govflow',
    'appPort': 9000,
    'plugins': { 'repositories': [MyServiceRepositoryPlugin] } as PluginRegistry
} as Partial<AppConfig>;
