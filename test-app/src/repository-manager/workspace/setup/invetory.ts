import { createRepository } from "../../core";
import { createLogger, createScopedObserver, createStore, type ScopeNode } from "../../infrastructure";
import type { IRepositoryConfig, IRepositoryInstance, IWorkspaceConfig } from "../../types";

function createInventory<D = any>(config: IWorkspaceConfig<D>, scopes: ScopeNode[]){
    const { id, logging } = config;
    const defaultConfig: Omit<IWorkspaceConfig, "dependencies" | "onMount"> = {
        id,
        logging: logging ?? false,
    };
    const logger = createLogger(defaultConfig);
    const store = createStore<IRepositoryInstance<any>>();
    const observer = createScopedObserver(
        scopes ?? []
    );
    return {
        run(repositories: IRepositoryConfig<D, any>[]){
            repositories.forEach((repository) => {
                const { id } = repository;
                if (store.hasState(id)) return;
                store.setState(id, createRepository(config.dependencies, repository, observer))
            });
            return {
                logger,
                store,
                observer,
                allRepositories: () => {
                    return Array.from(store.getEntries()).map(([id, repository]) => ({
                        repository: id,
                        connections: repository.connections,
                    }));
                },
                dependencies: config.dependencies,
            }
        },
    }
}

export { createInventory };