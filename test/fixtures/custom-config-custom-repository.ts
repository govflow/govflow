import { AppConfig, PluginRegistry } from '../../src/types';
import { MyServiceRepositoryPlugin } from './repositories';

export const config = {
    'plugins': { 'repositories': [MyServiceRepositoryPlugin] } as PluginRegistry
} as Partial<AppConfig>;
