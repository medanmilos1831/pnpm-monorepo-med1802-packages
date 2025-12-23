import { createRepositoryReference } from "./createRepositoryReference";
import { createStore } from "./store";
import { createLogger } from "./logger";
const repositoryManager = () => {
  return {
    createContainer<C extends Record<string, any>>(config: C) {
      const store = createStore();
      const logger = createLogger();

      const getRepository = (id: string) => store.getRepository(id);
      const hasRepository = (id: string) => store.hasRepository(id);

      return {
        defineRepository(
          id: string,
          repositoryDefinition: (config: C) => void
        ) {
          if (hasRepository(id)) return;
          logger.log(
            () => {
              store.setRepository(
                id,
                createRepositoryReference(repositoryDefinition, config)
              );
            },
            {
              type: "repository.define",
              scope: id,
              metadata: () => {
                return {
                  repositories: Array.from(store.entries()).map(
                    ([id, repository]) => ({
                      id,
                    })
                  ),
                };
              },
            }
          );
        },
        queryRepository<R = any>(id: string) {
          const repository = getRepository(id);
          if (!repository) {
            throw new Error(`Repository "${id}" not found`);
          }
          logger.log(() => repository.connect(), {
            type: "repository.connect",
            scope: id,
            metadata: () => {
              return {
                connections: Array.from(store.entries()).map(
                  ([id, repository]) => ({
                    id,
                    value: repository.getConnections(),
                  })
                ),
              };
            },
          });
          return {
            repository: repository.getItem() as R,
            disconnect: () =>
              logger.log(() => repository.disconnect(), {
                type: "repository.disconnect",
                scope: id,
                metadata: () => {
                  return {
                    connections: Array.from(store.entries()).map(
                      ([id, repository]) => ({
                        id,
                        value: repository.getConnections(),
                      })
                    ),
                  };
                },
              }),
          };
        },
      };
    },
  };
};

export { repositoryManager };
