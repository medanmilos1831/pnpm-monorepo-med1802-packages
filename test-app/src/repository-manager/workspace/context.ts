import {
  createBroker,
  createLogger,
  createScope,
  createStore,
  useScope,
} from "../infrastructure";
import type { IRepositoryInstance } from "../core";

import type { IConfiguration } from "./types";

interface IWorkspaceContext<I = any> {
  store: ReturnType<typeof createStore<IRepositoryInstance<any>>>;
  logger: ReturnType<typeof createLogger>;
  infrastructure: I;
  broker: ReturnType<typeof createBroker>;
}

const workspaceScope = createScope<IWorkspaceContext | undefined>(undefined);

function createWorkspaceContext<I>(
  params: IConfiguration<I>,
  child: () => void
) {
  const { id, logging, infrastructure } = params;
  const defaultConfig: Omit<IConfiguration, "infrastructure"> = {
    id,
    logging: logging ?? false,
  };
  const logger = createLogger(defaultConfig);
  const store = createStore<IRepositoryInstance<any>>();
  const broker = createBroker();
  workspaceScope.provider(
    {
      store,
      logger,
      infrastructure,
      broker,
    },
    () => {
      child();
    }
  );
}

function workspace<I>() {
  const context = useScope<IWorkspaceContext<I>>(workspaceScope)!;
  return context;
}

export { createWorkspaceContext, workspace };
