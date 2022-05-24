import { AppConfig, PluginRegistry } from '../../src/types';
import { MyBrokenJurisdictionRepositoryPlugin } from './repositories';

export const config = {
    'plugins': { 'repositories': [MyBrokenJurisdictionRepositoryPlugin] } as PluginRegistry
} as Partial<AppConfig>;
