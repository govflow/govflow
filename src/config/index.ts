import nconf from 'nconf';
import type { AppSettings, ConfigItem } from '../types';

nconf.defaults({
    env: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG || false,
    locales: ['en'],
    database_url: process.env.DATABASE_URL || 'postgres://pwalsh@localhost:5432/zen311', // 'postgres://zen311@localhost:5432/zen311',
    app_port: process.env.APP_PORT || 3000,
});

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
