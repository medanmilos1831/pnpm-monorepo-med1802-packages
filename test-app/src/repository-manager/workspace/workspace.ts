import type { IConfiguration } from "../types";
import {
  createRepositoryModule,
  createContextModule,
  type IContextConfig,
  type IRepositoryInstance,
} from "./modules";
import { createContext, createLogger, createStore } from "./infrastructure";
import { useCtx } from "./infrastructure/context/context";

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
  const userContext = createContext({
    id: "user-context",
    value: "DEFAULT USER CONTEXT VALUE",
  });
  const companyContext = createContext({
    id: "company-context",
    value: "company-context-value",
  });
  userContext.provider({
    value: "***** USER PROVIDER VALUE *****",
    children: () => {
      companyContext.provider({
        value: "***** COMPANY PROVIDER VALUE *****",
        children: () => {
          const user = useCtx(userContext);
          const company = useCtx(companyContext);
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
