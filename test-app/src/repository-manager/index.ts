import type { IConfiguration, IWorkspace } from "./types";
import { createWorkspace } from "./workspace";
import { createStore } from "./workspace/infrastructure";

const repositoryManager = () => {
  const store = createStore<IWorkspace<any>>();
  return {
    workspace<I extends Record<string, any>>(
      infrastructure: I,
      config: IConfiguration
    ) {
      const workspace = createWorkspace(infrastructure, config);
      store.setState(config.id, workspace as any);
      return {
        defineRepository: workspace.defineRepository,
        createContext: workspace.createContext,
        queryRepository: workspace.queryRepository,
      };
    },
  };
};

export { repositoryManager };
