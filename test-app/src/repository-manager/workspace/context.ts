import {
  createLogger,
  createScope,
  createScopedObserver,
  createStore,
  useScope,
} from "../infrastructure";
import type { IRepositoryInstance } from "../core";

import type { IConfiguration } from "./types/configuration.types";

interface IWorkspaceContext<I = any> {
  store: ReturnType<typeof createStore<IRepositoryInstance<any>>>;
  logger: ReturnType<typeof createLogger>;
  observer: ReturnType<typeof createScopedObserver>;
  infrastructure: I;
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
  const observer = createScopedObserver([
    {
      scope: "user-repo",
    },
    {
      scope: "company-repo",
    },
  ]);
  workspaceScope.provider(
    {
      store,
      logger,
      observer,
      infrastructure,
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
