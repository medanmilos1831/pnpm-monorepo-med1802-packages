import { createRepositoryReference } from "./createRepositoryReference";
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
            const reference = createRepositoryReference(id, () =>
              repositoryDefinition(config.infrastructure)
            );
            prev.repositories.set(id, reference);
            return prev;
          });
        },
        queryRepository(id: string) {
          const repository = getRepository(id);
          if (!repository) {
            throw new Error(`Repository "${id}" not found`);
          }
          repository.connect();
          return {
            repository: repository?.getItem(),
            disconnect: () => repository?.disconnect(),
          };
        },
      };
    },
  };
};

export { repositoryManager };
