import { createContainerInstance } from "./containerInstance";
import { createStore } from "./store";
import type { IContainerInstance, ManagerType } from "./types";

function repositoryManager<D>(config: ManagerType<D>) {
  const globalStore = createStore<IContainerInstance>();
  config.forEach((containerConfig) => {
    globalStore.setState(
      containerConfig.id,
      createContainerInstance(containerConfig)
    );
  });

  return {
    query(path: string) {
      const [containerId, id] = path.split("/");
      const container = globalStore.getState(containerId) as IContainerInstance;
      return container.query(id) as any;
    },
  };
}

export { repositoryManager };
