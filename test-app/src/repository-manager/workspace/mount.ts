import {
  createLogger,
  createScope,
  createStore,
  useScope,
} from "../infrastructure";
import type { IRepositoryInstance } from "../repository";

import type { IConfiguration } from "./types";

const workspaceScope = createScope<any>(undefined);

const mountWorkspace = (
  params: {
    config: IConfiguration;
    infrastructure: any;
  },
  child: () => void
) => {
  const { config, infrastructure } = params;
  const defaultConfig: IConfiguration = {
    id: config.id,
    logging: config.logging ?? false,
  };
  const logger = createLogger(defaultConfig);
  const store = createStore<IRepositoryInstance<any>>();
  workspaceScope.provider(
    {
      store,
      logger,
      infrastructure,
    },
    () => {
      child();
    }
  );
};

const workspace = () => {
  const context = useScope(workspaceScope);
  return context;
};

export { mountWorkspace, workspace };
