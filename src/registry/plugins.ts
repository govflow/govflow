import type { Plugin, PluginRegistry } from '../types';

export function registerPlugins(customPlugins: Plugin[]): PluginRegistry {
    const pluginRegistry: PluginRegistry = [];
    customPlugins.forEach((plugin) => {
        bindPlugin(plugin, pluginRegistry);
    });
    return pluginRegistry;
}

function bindPlugin(plugin: Plugin, registry: PluginRegistry): Plugin {
    registry.push(plugin);
    return plugin;
}
