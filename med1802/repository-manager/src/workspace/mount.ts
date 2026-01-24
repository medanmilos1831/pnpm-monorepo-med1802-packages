import { createRepository } from "../core";
import { workspace } from "./context";

function mountWorkspace<I>() {
  const { store, logger, dependencies, observer, plugins } = workspace<I>();

  function allRepositories() {
    return Array.from(store.getEntries()).map(([id, repository]) => ({
      repository: id,
      connections: repository.connections,
    }));
  }
  plugins.forEach((repo) => {
    const { id } = repo;
    if (store.hasState(id)) return;
    logger.log(
      () => {
        store.setState(id, createRepository(dependencies, repo, observer));
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
  });
}

export { mountWorkspace };
