import type { IConfiguration } from "../types";
import {
  createRepositoryModule,
  createContextModule,
  type IContextConfig,
  type IRepositoryInstance,
} from "./modules";
import { createScope, createLogger, createStore } from "./infrastructure";
import { useScope } from "./infrastructure/scope/scope";

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
  const userContext = createScope("***** DEFAULT USER VALUE *****");
  const companyContext = createScope<string>(
    "***** DEFAULT COMPANY VALUE *****"
  );
  userContext.provider({
    value: "***** OVERRIDE *****",
    children: () => {
      companyContext.provider({
        value: "***** COMPANY PROVIDER VALUE *****",
        children: () => {
          const user = useScope(userContext);
          const company = useScope(companyContext);
          console.log("user", user);
          console.log("company", company);
        },
      });
    },
  });
  const repositoryServices = createRepositoryModule({
    store,
    logger,
    infrastructure,
    contextStore,
  });
  const contextServices = createContextModule({
    contextStore,
  });

  return {
    defineRepository: repositoryServices.defineRepository,
    queryRepository: repositoryServices.queryRepository,
    createContext: contextServices.createContext,
  };
}

export { createWorkspace };
