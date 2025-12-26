import { createWorkspace, createStore } from "./core";

import type { IConfiguration, IWorkspace } from "./types";

const repositoryManager = () => {
  const store = createStore<IWorkspace<any>>();
  return {
    workspace<I extends Record<string, any>>(
      infrastructure: I,
      config: IConfiguration
    ) {
      const workspace = createWorkspace(infrastructure, config);
      store.setState(config.id, workspace);
      return {
        defineRepository: workspace.defineRepository,
      };
    },
    query<R = any>(path: string) {
      const [containerId, repositoryId] = path.split("/");
      const container = store.getState(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }
      const queryRepository = container.queryRepository as IWorkspace<
        any,
        R
      >["queryRepository"];
      return queryRepository(repositoryId);
    },
  };
};

export { repositoryManager };
