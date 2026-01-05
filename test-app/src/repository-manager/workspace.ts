import { createLogger } from "./logger";
import { createRepositoryAccessor } from "./repositoryAccessor";
import { createStore } from "./store";
import type {
  IConfiguration,
  ILifeCycle,
  IRepositoryConfig,
  IRepositoryInstance,
  IRepositoryPlugin,
  Middleware,
  repositoryType,
} from "./types";

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
      connections: repository.connections,
    }));

  const defineRepository = (repositoryPlugin: IRepositoryPlugin<I, any>) => {
    if (hasRepository(repositoryPlugin.id)) return;
    const { id, install, middlewares, onConnect, onDisconnect } =
      repositoryPlugin;
    logger.log(
      () => {
        store.setState(
          id,
          createRepositoryAccessor(install, infrastructure, {
            middlewares,
            onConnect,
            onDisconnect,
          })
        );
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
    const entity = store.getState(id);
    if (!entity) {
      throw new Error(`Repository "${id}" not found`);
    }
    logger.log(() => entity.connect(), {
      type: "repository.connect",
      scope: id,
      metadata: () => {
        return {
          connections: allRepositories(),
        };
      },
    });
    const { repository } = entity;
    return {
      repository,
      disconnect() {
        entity.disconnect();
      },
    };
  };

  return {
    defineRepository,
    queryRepository,
  };
}

export { createWorkspace };
