import type { pluginType } from "../types";
import { workspace } from "../workspace";

function createWorkspaceClient<I>() {
  const { store, logger } = workspace<I>();

  function allRepositories() {
    return Array.from(store.getEntries()).map(([id, repository]: any) => ({
      repository: id,
      connections: repository.connections,
    }));
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
      repository: repository as ReturnType<pluginType<I, R>>,
      disconnect() {
        entity.disconnect();
      },
    };
  }
  return {
    queryRepository,
  };
}

export { createWorkspaceClient };
