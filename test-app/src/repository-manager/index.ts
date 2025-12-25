import { createRepositoryInstance } from "./repositoryInstance";
import { createStore } from "./store";
import { createLogger } from "./logger";
import type { IConfiguration, IContainerInstance } from "./types";
import { createGlobalStore } from "./globalStore";
import { createContainerInstance } from "./containerInstance";
const repositoryManager = () => {
  const globalStore = createGlobalStore<IContainerInstance<any>>();
  return {
    createContainer<I extends Record<string, any>>(
      infrastructure: I,
      config: IConfiguration
    ) {
      globalStore.setState(
        config.id,
        createContainerInstance(infrastructure, config)
      );
      return globalStore.getState(config.id) as IContainerInstance<I>;
    },
    query(path: string) {
      const [containerId, repositoryId] = path.split("/");
      const container = globalStore.getState(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} not found`);
      }
      const item = container.queryRepository(repositoryId)!;

      return item.repository;
    },
  };
};

export { repositoryManager };
