import { createStore } from "./store";

const REPOSITORY_MANAGER_ID = "repository-manager";

const repositoryManager = () => {
  return {
    createContainer<I extends Record<string, any>>(config: {
      infrastructure: I;
    }) {
      const repositoryStore = createStore<any>({
        id: REPOSITORY_MANAGER_ID,
        state: {
          repositories: new Map<string, any>(),
          subscribedRepositories: new Map<string, any>(),
        },
        log: false,
      });
      return {
        defineRepository(id: string, repo: (infrastructure: I) => void) {
          if (repositoryStore.getState().repositories.has(id)) {
            return;
          }
          repositoryStore.setState((prev) => {
            prev.repositories.set(id, repo);
            return prev;
          });
        },
        connectRepository(id: string) {
          if (repositoryStore.getState().subscribedRepositories.has(id)) {
            repositoryStore
              .getState()
              .subscribedRepositories.get(id)!.connections += 1;
            return repositoryStore.getState().subscribedRepositories.get(id);
          }
          const repo = repositoryStore.getState().repositories.get(id)(
            config.infrastructure
          );
          repositoryStore.setState((prev) => {
            prev.subscribedRepositories.set(id, {
              repo,
              unsubscribe: () => {
                repositoryStore.setState((prev) => {
                  prev.subscribedRepositories.get(id)!.connections -= 1;
                  if (prev.subscribedRepositories.get(id)!.connections === 0) {
                    prev.subscribedRepositories.delete(id);
                  }
                  return prev;
                });
              },
              connections: 1,
            });
            return prev;
          });
          console.log("CONNECTED REPOSITORY", repositoryStore.getState());
          return repositoryStore.getState().subscribedRepositories.get(id).repo;
        },
        disconnectRepository(id: string) {
          if (!repositoryStore.getState().subscribedRepositories.has(id)) {
            return;
          }
          repositoryStore
            .getState()
            .subscribedRepositories.get(id)
            .unsubscribe();
          console.log("DISCONNECTED REPOSITORY", repositoryStore.getState());
        },
        destoryRepository(id: string) {
          if (!repositoryStore.getState().subscribedRepositories.has(id)) {
            return;
          }
          repositoryStore.setState((prev) => {
            prev.repositories.delete(id);
            prev.subscribedRepositories.delete(id);
            return prev;
          });
        },
      };
    },
  };
};

export { repositoryManager };
