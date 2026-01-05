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
    createContext<V = any>(config: IContext<V>) {
      const workspace = store.getState(config.workspace)!;
      // console.log("CREATE CONTEXT", workspace);
      workspace.createContext<V>(config);
    },
  };
};

export { repositoryManager };
