import type { AppSettings, Plugin } from '../types';

export function registerPlugins(appSettings: AppSettings | void): Plugin[] {
    let pluginRegistry: Plugin[] = new Array();
    if (appSettings && Object.hasOwnProperty.call(appSettings, 'plugins')) {
        appSettings.plugins.forEach((plugin) => {
            bindPlugin(plugin, pluginRegistry);
        });
    }
    return pluginRegistry;
}

function bindPlugin(plugin: Plugin, registry: Plugin[]): Plugin {
    registry.push(plugin);
    return plugin;
}
