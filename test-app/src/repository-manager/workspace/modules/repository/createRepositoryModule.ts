import { createRepositoryAccessor } from "./repositoryAccessor";
import type { IRepositoryPlugin, repositoryType } from "./types";
import { useScope } from "../../infrastructure";
import { repositoryScope } from "../../providers";

function createRepositoryModule<I extends Record<string, any>>() {
  const { store, logger, infrastructure, contextStore } =
    useScope(repositoryScope);
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
          createRepositoryAccessor(infrastructure, repositoryPlugin)
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
  };
}

export { createRepositoryModule };
