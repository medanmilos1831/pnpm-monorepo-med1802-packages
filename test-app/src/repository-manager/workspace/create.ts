import {
  createLogger,
  createScope,
  createStore,
  useScope,
} from "../infrastructure";
import type { IRepositoryInstance } from "../repository";

import type { IConfiguration } from "./types";

const workspaceScope = createScope<any>(undefined);

function createWorkspace(params: IConfiguration, child: () => void) {
  const { id, logging, infrastructure } = params;
  const defaultConfig: Omit<IConfiguration, "infrastructure"> = {
    id,
    logging: logging ?? false,
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
}

const workspace = () => {
  const context = useScope(workspaceScope);
  return context;
};

export { createWorkspace, workspace };
