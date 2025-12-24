import { createContainerInstance, createStore } from "./core";
import type { IContainerInstance, IManagerConfig } from "./types";

function repositoryManager<D>(config: IManagerConfig<D>[]) {
  const store = createStore<IContainerInstance<unknown>>();
  config.forEach((containerConfig) => {
    store.setState(
      containerConfig.id,
      createContainerInstance(containerConfig)
    );
  });

  return {
    query<R>(path: string) {
      const [containerId, id] = path.split("/");
      const container = store.getState(containerId) as IContainerInstance<R>;
      if (!container) {
        throw new Error(`Container "${containerId}" not found`);
      }
      return container.queryRepository(id);
    },
  };
}

export { repositoryManager };
