import { createContainer, createStore } from "./core";
import type { IConfiguration, IContainerInstance } from "./types";

const repositoryManager = () => {
  const store = createStore<IContainerInstance<any>>();
  return {
    createContainer<I extends Record<string, any>>(
      infrastructure: I,
      config: IConfiguration
    ) {
      store.setState(config.id, createContainer(infrastructure as I, config));
      const container = store.getState(config.id);
      if (!container) {
        throw new Error(`Container ${config.id} not found`);
      }
      const defineRepository =
        container.defineRepository as IContainerInstance<I>["defineRepository"];
      return {
        defineRepository,
      };
    },
    query<R = any>(path: string) {
      const [containerId, repositoryId] = path.split("/");
      const container = store.getState(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }
      const queryRepository = container.queryRepository as IContainerInstance<
        any,
        R
      >["queryRepository"];
      return queryRepository(repositoryId);
    },
  };
};

export { repositoryManager };
