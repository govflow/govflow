
export interface Plugin {
    serviceIdentifier: symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    implementation: {new (...args: any[]): unknown},
}

export type PluginRegistry = Plugin[];
