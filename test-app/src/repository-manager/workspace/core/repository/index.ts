import { createRepositoryAccessor } from "./repositoryAccessor";
import type { IContextConfig } from "../../../types";
import type { createStore } from "../../infrastructure";
import type { createLogger } from "../../infrastructure/logger";
import type {
  IRepositoryInstance,
  IRepositoryPlugin,
  repositoryType,
} from "./types";

function createRepositoryServices<I extends Record<string, any>>({
  store,
  logger,
  infrastructure,
  contextStore,
}: {
  store: ReturnType<typeof createStore<IRepositoryInstance<any>>>;
  logger: ReturnType<typeof createLogger>;
  infrastructure: I;
  contextStore: ReturnType<typeof createStore<IContextConfig<any>[]>>;
}) {
  function hasRepository(id: string) {
    return store.hasState(id);
  }
  function allRepositories() {
    return Array.from(store.getEntries()).map(([id, repository]: any) => ({
      repository: id,
      connections: repository.connections,
    }));
  }

  function defineRepository<R = any, C = any>(
    repositoryPlugin: IRepositoryPlugin<I, R>
  ) {
    const { id } = repositoryPlugin;
    if (hasRepository(id)) return;
    logger.log(
      () => {
        store.setState(
          id,
          createRepositoryAccessor(
            infrastructure,
            repositoryPlugin,
            (id: string) => {
              const value = contextStore.getState("stack")!;
              let result = value.filter((item: any) => item.id === id);
              return result[result.length - 1]?.value as C;
            }
          )
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
  }

  function queryRepository<R = any>(id: string) {
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
      repository: repository as ReturnType<repositoryType<I, R>>,
      disconnect() {
        entity.disconnect();
      },
    };
  }
  return {
    queryRepository,
    defineRepository,
    hasRepository,
    allRepositories,
  };
}

export { createRepositoryServices };
