import { createRepository } from "../core";
import { createLogger, createScopedObserver, createStore } from "../infrastructure";
import type { IRepository, IWorkspaceConfig } from "../types";

function mountWorkspace<D = any>(config: IWorkspaceConfig<D>){
    const { id, logging, plugins } = config;
    const defaultConfig: Omit<IWorkspaceConfig, "dependencies" | "plugins"> = {
        id,
        logging: logging ?? false,
    };
    const repositories = plugins();
    const logger = createLogger(defaultConfig);
    const store = createStore<IRepository<any>>();
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
        repositories,
        dependencies: config.dependencies,
    }
}

export { mountWorkspace };
