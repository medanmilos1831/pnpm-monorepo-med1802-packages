import { createStore } from "./store";
import type { IConfiguration, IContext, IWorkspace } from "./types";
import { createWorkspace } from "./workspace";

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
        createContext: workspace.createContext,
        queryRepository: workspace.queryRepository,
      };
    },
  };
};

export { repositoryManager };
