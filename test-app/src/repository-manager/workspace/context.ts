import {
  createLogger,
  createScope,
  createScopedObserver,
  createStore,
  useScope,
} from "../infrastructure";
import type { IRepositoryInstance, IRepositoryPlugin } from "../core";
import type { IConfiguration } from "./types";

interface IWorkspaceContext<D = any> {
  store: ReturnType<typeof createStore<IRepositoryInstance<any>>>;
  logger: ReturnType<typeof createLogger>;
  observer: ReturnType<typeof createScopedObserver>;
  dependencies: D;
  plugins: IRepositoryPlugin<D, any>[];
}

const workspaceScope = createScope<IWorkspaceContext<any> | undefined>(
  undefined
);

function createWorkspaceContext<D = any>(
  params: IConfiguration<D>,
  child: () => void
) {
  const { id, logging, dependencies, plugins } = params;
  const defaultConfig: Omit<IConfiguration, "dependencies" | "plugins"> = {
    id,
    logging: logging ?? false,
  };
  const repos = plugins();
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
      plugins: repos,
      dependencies,
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
