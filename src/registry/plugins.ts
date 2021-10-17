import type { AppSettings, Plugin } from '../types';

const pluginRegistry: Plugin[] = []

function registerPlugins(appSettings: AppSettings | void): Plugin[] {
    if (appSettings && Object.hasOwnProperty.call(appSettings, 'plugins')) {
        appSettings.plugins.forEach((plugin) => {
            bindPlugin(plugin);
        });
    }
    return pluginRegistry;
}

function bindPlugin(plugin: Plugin): Plugin {
    pluginRegistry.push(plugin);
    return plugin;
}

export { registerPlugins, pluginRegistry };
