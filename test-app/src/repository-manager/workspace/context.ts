import {
  createLogger,
  createScope,
  createScopedObserver,
  createStore,
  useScope,
} from "../infrastructure";
import type { IRepositoryInstance, IRepositoryPlugin } from "../core";

import type { IConfiguration } from "./types/configuration.types";

interface IWorkspaceContext<I = any> {
  store: ReturnType<typeof createStore<IRepositoryInstance<any>>>;
  logger: ReturnType<typeof createLogger>;
  observer: ReturnType<typeof createScopedObserver>;
  infrastructure: I;
  repositories: IRepositoryPlugin<I, any>[];
}

const workspaceScope = createScope<IWorkspaceContext | undefined>(undefined);

function createWorkspaceContext<I>(
  params: IConfiguration<I>,
  child: () => void
) {
  const { id, logging, infrastructure, repositories } = params;
  const defaultConfig: Omit<IConfiguration, "infrastructure" | "repositories"> =
    {
      id,
      logging: logging ?? false,
    };
  console.log("REPOSITORIES", repositories());
  const repos = repositories();
  const logger = createLogger(defaultConfig);
  const store = createStore<IRepositoryInstance<any>>();
  const observer = createScopedObserver(
    repos.map((repo) => ({ scope: repo.id }))
  );
  workspaceScope.provider(
    {
      store,
      logger,
      observer,
      infrastructure,
      repositories: repos,
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
