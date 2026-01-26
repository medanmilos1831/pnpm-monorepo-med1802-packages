import { createRepository } from "../core";
import { createLogger, createScopedObserver, createStore } from "../infrastructure";
import type { IRepositoryConfig, IRepositoryInstance, IWorkspaceConfig } from "../types";

function mountWorkspace<D = any>(config: IWorkspaceConfig<D>, repos: IRepositoryConfig<D, any>[]){
    const { id, logging } = config;
    const defaultConfig: Omit<IWorkspaceConfig, "dependencies"> = {
        id,
        logging: logging ?? false,
    };
    // const items = repositories();
    const logger = createLogger(defaultConfig);
    const store = createStore<IRepositoryInstance<any>>();
    const observer = createScopedObserver(
        repos.map((repo) => ({ scope: repo.id }))
    );
    repos.forEach((repo) => {
        const { id } = repo;
        if (store.hasState(id)) return;
        store.setState(id, createRepository(config.dependencies, repo, observer))

      });
    return {
        store,
        logger,
        observer,
        allRepositories: () => {
            return Array.from(store.getEntries()).map(([id, repository]) => ({
                repository: id,
                connections: repository.connections,
            }));
        },
        defineRepository<R = any>(
            repository: IRepositoryConfig<D, R>
          ) {
            const { id } = repository;
            if (store.hasState(id)) return;
            createRepository(config.dependencies, repository, observer)
          },
        dependencies: config.dependencies,
    }
}

export { mountWorkspace };
