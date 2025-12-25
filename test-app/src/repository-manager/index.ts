import { createContainerInstance, createStore } from "./core";
import type { IConfiguration, IContainerInstance } from "./types";

const repositoryManager = () => {
  const store = createStore<IContainerInstance<any>>();
  return {
    createContainer<I extends Record<string, any>>(
      infrastructure: I,
      config: IConfiguration
    ) {
      store.setState(
        config.id,
        createContainerInstance(infrastructure, config)
      );
      return store.getState(config.id)?.defineRepository!;
    },
    query<R = any>(path: string) {
      const [containerId, repositoryId] = path.split("/");
      const container = store.getState(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }

      return container.queryRepository<R>(repositoryId);
    },
  };
};

export { repositoryManager };
