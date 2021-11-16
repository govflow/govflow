import nconf from 'nconf';
import type { AppSettings, ConfigItem } from '../types';

nconf.use('memory');
nconf.set('env', process.env.NODE_ENV || 'development');
nconf.set('database_url', process.env.DATABASE_URL || 'postgres://pwalsh@localhost:5432/govflow');
nconf.set('app_port', process.env.APP_PORT || 3000);

class Config {
    get(key: string) {
        return nconf.get(key)
    }

    set(key: string, value: unknown) {
        nconf.set(key, value)
        return nconf.get(key)
    }
}

const config = new Config();

function registerConfig(appSettings: AppSettings | void): Config {
    if (appSettings && Object.hasOwnProperty.call(appSettings, 'config')) {
        appSettings.config.forEach((configItem: ConfigItem) => {
            nconf.set(configItem.key, configItem.value);
        });
    }
    return config;
}

export {
    config,
    registerConfig
};
