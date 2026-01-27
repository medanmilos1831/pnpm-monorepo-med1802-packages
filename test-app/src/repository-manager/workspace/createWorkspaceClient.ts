import type { repositoryType } from "../types";
import { workspace } from ".";

function createWorkspaceClient<I>() {
  const { store, allRepositories, logger } = workspace<I>();

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
  };
}

export { createWorkspaceClient };
