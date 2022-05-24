import { RequestHandler } from "express";
import { ModelDefinition } from "./db";

export interface RepositoryPlugin {
    serviceIdentifier: symbol;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    implementation: { new(...args: any[]): unknown };
}

export interface ServicePlugin {
    serviceIdentifier: symbol;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    implementation: { new(...args: any[]): unknown };
}

export interface MiddlewarePlugin {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    factory: { (...args: any[]): RequestHandler };
    factoryArgs: [];
}

export type ModelPlugin = ModelDefinition;

export interface MigrationPlugin {
    pathPattern: string;
}

export interface PluginRegistry {
    repositories: RepositoryPlugin[];
    services: ServicePlugin[];
    middlewares: MiddlewarePlugin[];
    models: ModelPlugin[];
    migrations: MigrationPlugin[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginBase {
    //plugin?: boolean;
}
