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
      return store.getState(config.id) as IContainerInstance<I>;
    },
    query(path: string) {
      const [containerId, repositoryId] = path.split("/");
      const container = store.getState(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }
      const item = container.queryRepository(repositoryId)!;

      return item.repository;
    },
  };
};

export { repositoryManager };
