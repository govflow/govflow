export interface Plugin {
    serviceIdentifier: symbol,
    implementation: { new(): unknown }
}

export type PluginRegistry = Plugin[];
