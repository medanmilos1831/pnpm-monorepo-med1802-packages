import { createLogger, createScopedObserver, createScope, createStore, useScope, type ScopeNode } from "../../infrastructure";
import type { IRepositoryConfig, IRepositoryInstance, IWorkspaceConfig } from "../../types";


interface IWorkspaceSetupContext<D = any> {
    id: string,
    dependencies: D,
    repositories: IRepositoryConfig<D, any>[],
    scopes: ScopeNode[],
    logger: ReturnType<typeof createLogger>,
    store: ReturnType<typeof createStore<IRepositoryInstance<any>>>,
    observer: ReturnType<typeof createScopedObserver>,
    allRepositories: () => { repository: string, connections: number }[],
}
const setupScope = createScope<IWorkspaceSetupContext<any> | undefined>(undefined);

function setupWorkspaceProvider<D = any>(config: IWorkspaceConfig<D>, child: () => void){
    let repositories = [] as IRepositoryConfig<D, any>[];
    let scopes = [] as ScopeNode[];
    config.onSetup({
        useRepository<R>(repository: IRepositoryConfig<D, R>){
            repositories.push(repository);
        }
    });
    scopes = repositories.map((repository) => ({ scope: repository.id }));
    const defaultConfig: Omit<IWorkspaceConfig, "dependencies" | "onSetup"> = {
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

function useWorkspaceSetup<D = any>(){
    const context = useScope<IWorkspaceSetupContext<D>>(setupScope)!;
    return context;
}

export { setupWorkspaceProvider, useWorkspaceSetup };