import { createRepository } from "./repository";
import { createStore } from "./store";

const REPOSITORY_MANAGER_ID = "repository-manager";

const repositoryManager = () => {
  return {
    createContainer<I extends Record<string, any>>(config: {
      infrastructure: I;
    }) {
      const store = createStore<any>({
        id: REPOSITORY_MANAGER_ID,
        state: {
          repositories: new Map<string, any>(),
        },
        log: false,
      });

      const getRepositories = () => store.getState().repositories;
      const getRepository = (id: string) => getRepositories().get(id);
      const hasRepository = (id: string) => getRepositories().has(id);

      return {
        defineRepository(
          id: string,
          repositoryDefinition: (infrastructure: I) => void
        ) {
          if (hasRepository(id)) return;
          store.setState((prev) => {
            const repository = createRepository(id, () =>
              repositoryDefinition(config.infrastructure)
            );
            prev.repositories.set(id, repository);
            return prev;
          });
        },
        useRepository(id: string) {
          return getRepository(id);
        },
        deleteRepository(id: string) {
          store.setState((prev) => {
            prev.repositories.delete(id);
            return prev;
          });
        },
      };
    },
  };
};

export { repositoryManager };
