import {
  createLogger,
  createScope,
  createScopedObserver,
  createStore,
  useScope,
} from "../infrastructure";
import type { IPlugin, IRepository, IWorkspaceConfig } from "../types";
import { mountWorkspace } from "./mount";

interface IWorkspaceContext<D = any> {
  store: ReturnType<typeof createStore<IRepository<any>>>;
  logger: ReturnType<typeof createLogger>;
  observer: ReturnType<typeof createScopedObserver>;
  dependencies: D;
  plugins: IPlugin<D, any>[];
}

const workspaceScope = createScope<IWorkspaceContext<any> | undefined>(
  undefined
);

function createWorkspaceContext<D = any>(
  params: IWorkspaceConfig<D>,
  child: () => void
) {
  const { id, logging, dependencies, plugins } = params;
  const defaultConfig: Omit<IWorkspaceConfig, "dependencies" | "plugins"> = {
    id,
    logging: logging ?? false,
  };
  const repos = plugins();
  const logger = createLogger(defaultConfig);
  const store = createStore<IRepository<any>>();
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
      mountWorkspace();
      child();
    }
  );
}

function workspace<I>() {
  const context = useScope<IWorkspaceContext<I>>(workspaceScope)!;
  return context;
}

export { createWorkspaceContext, workspace };
