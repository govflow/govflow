
/* eslint-disable */
export interface Plugin {
    serviceIdentifier: symbol,
    implementation: { new(): any }
}
/* eslint-disable */
