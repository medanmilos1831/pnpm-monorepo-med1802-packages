import { createRepository } from "../core";
import { createLogger, createScopedObserver, createStore } from "../infrastructure";
import type { IRepositoryConfig, IRepositoryInstance, IWorkspaceConfig } from "../types";

function mountWorkspace<D = any>(config: IWorkspaceConfig<D>){
    const { id, logging, onMount } = config;
    let repositories: IRepositoryConfig<D, any>[] = [];
    onMount({
        useRepository<R>(repository: IRepositoryConfig<D, R>){
            repositories.push(repository);
        }
    });
    const defaultConfig: Omit<IWorkspaceConfig, "dependencies" | "onMount"> = {
        id,
        logging: logging ?? false,
    };
    const logger = createLogger(defaultConfig);
    const store = createStore<IRepositoryInstance<any>>();
    const observer = createScopedObserver(
        repositories.map((repo) => ({ scope: repo.id }))
    );
    repositories.forEach((repo) => {
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
        dependencies: config.dependencies,
    }
}

export { mountWorkspace };
