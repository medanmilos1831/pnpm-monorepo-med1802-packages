import { createWorkspace } from "./workspace";
import { createStore } from "./workspace/infrastructure";
import { createRepositoryModule } from "./workspace/modules";
import { repositoryProvider } from "./workspace/providers";
import type { IConfiguration } from "./workspace/types";

const repositoryManager = () => {
  const store = createStore<ReturnType<typeof createWorkspace>>();
  return {
    workspace<I>(infrastructure: I, config: IConfiguration) {
      repositoryProvider(
        {
          config,
          infrastructure,
        },
        () => {
          store.setState(config.id, createRepositoryModule<I>());
        }
      );
      return {
        defineRepository: store.getState(config.id)!.defineRepository,
        queryRepository: store.getState(config.id)!.queryRepository,
      };
    },
  };
};

export { repositoryManager };
