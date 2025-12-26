import { createStore } from "./core";
import { createContainerService } from "./core/containerSerice";
import type { IConfiguration, IContainerInstance } from "./types";

const repositoryManager = () => {
  const store = createStore<IContainerInstance<any>>();
  return {
    createContainer<I extends Record<string, any>>(
      infrastructure: I,
      config: IConfiguration
    ) {
      const { create } = createContainerService(infrastructure, config);
      const { id, ...rest } = create();
      store.setState(id, rest);
      return {
        defineRepository: rest.defineRepository,
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
