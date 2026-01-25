import { createRepository } from "../core";
import { createLogger, createScopedObserver, createStore } from "../infrastructure";
import type { IRepositoryInstance, IWorkspaceConfig } from "../types";

function mountWorkspace<D = any>(config: IWorkspaceConfig<D>){
    const { id, logging, repositories } = config;
    const defaultConfig: Omit<IWorkspaceConfig, "dependencies" | "repositories"> = {
        id,
        logging: logging ?? false,
    };
    const items = repositories();
    const logger = createLogger(defaultConfig);
    const store = createStore<IRepositoryInstance<any>>();
    const observer = createScopedObserver(
        items.map((repo) => ({ scope: repo.id }))
    );
    items.forEach((repo) => {
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
        repositories,
        dependencies: config.dependencies,
    }
}

export { mountWorkspace };
