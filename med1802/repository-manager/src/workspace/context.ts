import {
  createLogger,
  createScope,
  createScopedObserver,
  createStore,
  useScope
} from "../infrastructure";
import type { IRepositoryInstance } from "../types";

interface IWorkspaceContext<D = any> {
  store: ReturnType<typeof createStore<IRepositoryInstance<any>>>;
  logger: ReturnType<typeof createLogger>;
  observer: ReturnType<typeof createScopedObserver>;
  dependencies: D;
  allRepositories: () => {
    repository: string;
    connections: number;
  }[];
}

const workspaceScope = createScope<IWorkspaceContext<any> | undefined>(
  undefined
);

function workspaceProvider<D = any>(
  value: IWorkspaceContext<D>,
  child: () => void
) {

  workspaceScope.provider(
    value,
    () => {
      child();
    }
  );
}

function workspace<I>() {
  const context = useScope<IWorkspaceContext<I>>(workspaceScope)!;
  return context;
}

export { workspaceProvider, workspace };
