import type { IConfiguration } from "./workspace/types";
import { createWorkspace } from "./workspace";
import { createStore } from "./workspace/infrastructure";
import type { IScope } from "./workspace/infrastructure/scope";

const repositoryManager = () => {
  const store = createStore<ReturnType<typeof createWorkspace>>();
  return {
    workspace<I>(infrastructure: I, config: IConfiguration) {
      const workspace = createWorkspace<I>(infrastructure, config);
      store.setState(config.id, workspace);
      return {
        defineRepository: workspace.defineRepository,
        queryRepository: workspace.queryRepository,
        createScope: workspace.createScope as unknown as <V = any>(
          defaultValue: V
        ) => IScope<V>,
      };
    },
  };
};

export { repositoryManager };
