import { createLogger } from "../logger";
import type {
  IConfiguration,
  IRepositoryInstance,
  repositoryType,
} from "../types";
import { createRepository } from "./repository";
import { createStore } from "./store";

function createWorkspace<I extends Record<string, any>>(
  infrastructure: I,
  config: IConfiguration
) {
  const defaultConfig: IConfiguration = {
    id: config.id,
    logging: config.logging ?? false,
  };
  const logger = createLogger(defaultConfig);
  const store = createStore<IRepositoryInstance<any>>();
  const hasRepository = (id: string) => store.hasState(id);
  const allRepositories = () =>
    Array.from(store.getEntries()).map(([id, repository]) => ({
      repository: id,
      connections: repository.getConnections(),
    }));

  const defineRepository = (id: string, repository: repositoryType<I, any>) => {
    if (hasRepository(id)) return;
    logger.log(
      () => {
        store.setState(id, createRepository(repository, infrastructure));
      },
      {
        type: "repository.define",
        scope: id,
        metadata() {
          return {
            repositories: allRepositories().map(({ repository }) => ({
              repository,
            })),
          };
        },
      }
    );
  };

  const queryRepository = (id: string) => {
    const repository = store.getState(id);
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
      repository: store.getState(id)?.getRepository(),
      disconnect() {
        store.setState(id, undefined as any);
      },
    };
  };

  return {
    defineRepository,
    queryRepository,
  };
}

export { createWorkspace };
