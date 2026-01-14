import { createStore } from "./infrastructure";
import {
  createRepositoryModule,
  repositoryProvider,
  type IConfiguration,
} from "./workspace";

const repositoryManager = () => {
  const store = createStore<ReturnType<typeof createRepositoryModule>>();
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
      const { defineRepository, queryRepository } = store.getState(config.id)!;
      return {
        defineRepository,
        queryRepository,
      };
    },
  };
};

export { repositoryManager };
