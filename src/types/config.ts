import { ModelDefinition } from './db';
import { Plugin } from './registry';

interface ConfigItem {
    key: string,
    /* eslint-disable */
    value: any
    /* eslint-enable */
}

interface AppSettings {
    plugins: Plugin[],
    config: ConfigItem[],
    models: ModelDefinition[]
}

interface Config {
    /* eslint-disable */
    get: (key: string) => any,
    set: (key: string, value: any) => any
    /* eslint-enable */
}

export {
    AppSettings,
    ConfigItem,
    Config
};
