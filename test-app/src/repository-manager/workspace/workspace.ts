import type { IConfiguration } from "../types";
import {
  createContextServices,
  createRepositoryServices,
  type IContextConfig,
  type IRepositoryInstance,
} from "./core";
import { createLogger, createStore } from "./infrastructure";

function createWorkspace<I extends Record<string, any>>(
  infrastructure: I,
  config: IConfiguration
) {
  const defaultConfig: IConfiguration = {
    id: config.id,
    logging: config.logging ?? false,
  };
  const logger = createLogger(defaultConfig);
  const store = createStore<IRepositoryInstance<any>>();
  const contextStore = createStore<IContextConfig<any>[]>();
  contextStore.setState("stack", []);
  const repositoryServices = createRepositoryServices({
    store,
    logger,
    infrastructure,
    contextStore,
  });
  const contextServices = createContextServices({
    contextStore,
  });

  return {
    defineRepository: repositoryServices.defineRepository,
    queryRepository: repositoryServices.queryRepository,
    createContext: contextServices.createContext,
  };
}

export { createWorkspace };
