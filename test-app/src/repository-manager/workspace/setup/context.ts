import { createLogger, createScopedObserver, createScope, createStore, useScope, type ScopeNode } from "../../infrastructure";
import type { IRepositoryConfig, IRepositoryInstance, IWorkspaceConfig } from "../../types";

const setupScope = createScope<any>(undefined);

function setupProvider<D = any>(config: IWorkspaceConfig<D>, child: () => void){
    let repositories = [] as IRepositoryConfig<D, any>[];
    let scopes = [] as ScopeNode[];
    config.onMount({
        useRepository<R>(repository: IRepositoryConfig<D, R>){
            repositories.push(repository);
        }
    });
    scopes = repositories.map((repository) => ({ scope: repository.id }));
    const defaultConfig: Omit<IWorkspaceConfig, "dependencies" | "onMount"> = {
        id: config.id,
        logging: config.logging ?? false,
    };
    const logger = createLogger(defaultConfig);
    const store = createStore<IRepositoryInstance<any>>();
    const observer = createScopedObserver(
        scopes ?? []
    );
    setupScope.provider({
        id: config.id,
        dependencies: config.dependencies,
        logging: config.logging,
        repositories,
        scopes,
        logger,
        store,
        observer,
        allRepositories: () => {
            return Array.from(store.getEntries()).map(([id, repository]) => ({
                repository: id,
                connections: repository.connections,
            }));
        },
    }, () => {
        child();
    });
}

function useSetup<D = any>(){
    const context = useScope<any>(setupScope)!;
    return context;
}

export { setupProvider, useSetup };