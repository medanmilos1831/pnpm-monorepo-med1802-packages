import { createContainerInstance, createStore } from "./core";
import type {
  IContainerInstance,
  IManagerConfig,
  RepositoryType,
} from "./types";

function createRepositoryManager() {
  const store = createStore<IContainerInstance<any>>();

  return {
    createContainer<D, R extends Record<string, RepositoryType<D>>>(
      config: IManagerConfig<D, R>
    ) {
      store.setState(config.id, createContainerInstance(config));
      if (!store.getState(config.id)) {
        throw new Error(`Container ${config.id} not found`);
      }
      return store.getState(config.id) as IContainerInstance<R>;
    },
  };
}

export { createRepositoryManager };
