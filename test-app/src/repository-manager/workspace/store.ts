import { createRepository } from "../core";
import type { scopedObserverType } from "../infrastructure/observer";
import { createStore } from "../infrastructure/store";
import type { IWorkspaceConfig } from "../types";
import type { IRepository } from "../types/repository.types";

const createWorkspaceStore = (config: IWorkspaceConfig, observer: scopedObserverType) => {
    const store = createStore<IRepository<any>>();
    const repositories = config.plugins();
    repositories.forEach((repo) => {
        const { id } = repo;
        if (store.hasState(id)) return;
        store.setState(id, createRepository(config.dependencies, repo, observer))

      });
    return {
        allRepositories: () => {
            return Array.from(store.getEntries()).map(([id, repository]) => ({
                repository: id,
                connections: repository.connections,
            }));
        },
        store

    }
}

export { createWorkspaceStore };