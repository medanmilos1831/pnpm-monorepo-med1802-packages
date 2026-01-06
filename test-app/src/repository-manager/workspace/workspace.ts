import type { IConfiguration } from "../types";
import {
  createRepositoryModule,
  createContextModule,
  type IContextConfig,
  type IRepositoryInstance,
} from "./modules";
import { createScope, createLogger, createStore } from "./infrastructure";
import { useScope } from "./infrastructure/scope/scope";
import { repositoryScope } from "./providers";

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
  let repositoryModule: ReturnType<typeof createRepositoryModule>;
  repositoryScope.provider({
    value: {
      store,
      logger,
      infrastructure,
      contextStore,
    },
    children: () => {
      repositoryModule = createRepositoryModule();
    },
  });
  const contextServices = createContextModule({
    contextStore,
  });

  return {
    defineRepository: repositoryModule!.defineRepository,
    queryRepository: repositoryModule!.queryRepository,
    createContext: contextServices.createContext,
  };
}

export { createWorkspace };
