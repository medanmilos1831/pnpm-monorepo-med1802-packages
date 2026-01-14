import { createStore } from "./infrastructure";
import { createRepositoryModule } from "./repository";
import { mountWorkspace, type IConfiguration } from "./workspace";

const repositoryManager = () => {
  const store = createStore<ReturnType<typeof createRepositoryModule>>();
  return {
    workspace<I>(infrastructure: I, config: IConfiguration) {
      mountWorkspace(
        {
          config,
          infrastructure,
        },
        () => {
          store.setState(config.id, createRepositoryModule<I>());
        }
      );
      const { defineRepository, queryRepository } = store.getState(config.id)!;
      return {
        defineRepository,
        queryRepository,
      };
    },
  };
};

export { repositoryManager };
