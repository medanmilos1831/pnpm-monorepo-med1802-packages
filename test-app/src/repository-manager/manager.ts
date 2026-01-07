import type { IConfiguration } from "./types";
import { createWorkspace } from "./workspace";
import { createStore } from "./workspace/infrastructure";

const repositoryManager = () => {
  const store = createStore<ReturnType<typeof createWorkspace>>();
  return {
    workspace<I>(infrastructure: I, config: IConfiguration) {
      const workspace = createWorkspace<I>(infrastructure, config);
      store.setState(config.id, workspace);
      return {
        defineRepository: workspace.defineRepository,
        queryRepository: workspace.queryRepository,
        createScope: workspace.createScope,
        useScope: workspace.useScope,
      };
    },
  };
};

export { repositoryManager };
