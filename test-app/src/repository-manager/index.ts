import { createRepositoryInstance } from "./repositoryInstance";
import { createStore } from "./store";
import { createLogger } from "./logger";
import type { IConfiguration } from "./types";
const repositoryManager = () => {
  return {
    createContainer<I extends Record<string, any>>(
      infrastructure: I,
      use: (
        definition: (
          path: string,
          repository: (infrastructure: I) => void
        ) => void
      ) => void,
      config?: IConfiguration
    ) {
      const defaultConfig: IConfiguration = {
        logging: false,
        ...config,
      };
      const store = createStore();
      const logger = createLogger(defaultConfig);

      const getRepository = (id: string) => store.getRepository(id);
      const hasRepository = (id: string) => store.hasRepository(id);
      const allRepositories = () =>
        Array.from(store.entries()).map(([id, repository]) => ({
          repository: id,
          connections: repository.getConnections(),
        }));

      function defRepository(
        path: string,
        repository: (infrastructure: I) => void
      ) {
        if (hasRepository(path)) return;
        logger.log(
          () => {
            store.setRepository(
              path,
              createRepositoryInstance(repository, infrastructure)
            );
          },
          {
            type: "repository.define",
            scope: path,
            metadata: () => {
              return {
                repositories: allRepositories().map(({ repository }) => ({
                  repository,
                })),
              };
            },
          }
        );
      }

      use(defRepository);

      return {
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
                connections: allRepositories(),
              };
            },
          });
          return {
            repository: repository.getReference() as R,
            disconnect: () =>
              logger.log(() => repository.disconnect(), {
                type: "repository.disconnect",
                scope: id,
                metadata: () => {
                  return {
                    connections: allRepositories(),
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
