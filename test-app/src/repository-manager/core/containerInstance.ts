import { createLogger } from "../logger";
import { createRepositoryInstance } from "./repositoryInstance";
import { createStore } from "./store";
import type { IManagerConfig, IRepositoryInstance } from "../types";

function createContainerInstance<D>(config: IManagerConfig<D>) {
  const { id, dependencies, repositories, logging } = config;
  const store = createStore<IRepositoryInstance>();
  const logger = createLogger({ logging: logging ?? false });
  const allRepositories = () =>
    Array.from(store.entries()).map(([id, repository]) => ({
      repository: id,
      connections: repository.getConnections(),
    }));
  logger.log(
    () => {
      Object.entries(repositories).forEach(([key, repository]) => {
        store.setState(key, createRepositoryInstance(repository, dependencies));
      });
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
  return {
    queryRepository(id: string) {
      const repository = store.getState(id);
      const allRepositories = () =>
        Array.from(store.entries()).map(([id, repository]: any) => ({
          repository: id,
          connections: repository.getConnections(),
        }));
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
        repository: repository.getReference(),
        disconnect: () => {
          store.getState(id)?.disconnect();
        },
      };
    },
  };
}

export { createContainerInstance };
