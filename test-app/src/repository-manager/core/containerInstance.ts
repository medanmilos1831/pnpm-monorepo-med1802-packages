import { createLogger } from "../logger";
import { createRepositoryInstance } from "./repositoryInstance";
import { createStore } from "./store";
import type { IConfiguration, IRepositoryInstance } from "../types";

function createContainerInstance<I extends Record<string, any>>(
  infrastructure: I,
  config: IConfiguration
) {
  const globalStore = createStore<IRepositoryInstance<any>>();
  const defaultConfig: IConfiguration = {
    id: config.id,
    logging: config.logging ?? false,
  };
  const hasRepository = (id: string) => globalStore.hasState(id);
  const allRepositories = () =>
    Array.from(globalStore.getEntries()).map(([id, repository]) => ({
      repository: id,
      connections: repository.getConnections(),
    }));
  const logger = createLogger(defaultConfig);
  return {
    defineRepository(
      id: string,
      repositoryDefinition: (infrastructure: I) => void
    ) {
      if (hasRepository(id)) return;
      logger.log(
        () => {
          globalStore.setState(
            id,
            createRepositoryInstance(repositoryDefinition, infrastructure)
          );
        },
        {
          type: "repository.define",
          scope: id,
          metadata: () => {
            return {
              repositories: allRepositories().map(({ repository }) => ({
                repository,
              })),
            };
          },
        }
      );
    },
    queryRepository<R = any>(id: string) {
      const repository = globalStore.getState(id);
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
}

export { createContainerInstance };
