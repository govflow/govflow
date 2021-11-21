export interface Plugin {
    serviceIdentifier: symbol,
    implementation: { new(): any }
}

export type PluginRegistry = Plugin[];
