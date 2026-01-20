import {
  createRepository,
  type IRepositoryPlugin,
  type repositoryType,
} from "../core";
import { workspace } from "../workspace";

function createWorkspaceClient<I>() {
  const { store, logger, dependencies, observer, plugins } = workspace<I>();
  plugins.forEach((obj: any) => {
    defineRepository(obj);
  });
  function hasRepository(id: string) {
    return store.hasState(id);
  }
  function allRepositories() {
    return Array.from(store.getEntries()).map(([id, repository]: any) => ({
      repository: id,
      connections: repository.connections,
    }));
  }

  function defineRepository<R = any>(
    repositoryPlugin: IRepositoryPlugin<I, R>
  ) {
    const { id } = repositoryPlugin;
    if (hasRepository(id)) return;
    logger.log(
      () => {
        store.setState(
          id,
          createRepository(dependencies, repositoryPlugin, observer)
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
    defineRepository,
    queryRepository,
  };
}

export { createWorkspaceClient };
