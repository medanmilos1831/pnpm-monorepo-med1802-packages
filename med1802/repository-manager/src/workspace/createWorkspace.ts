import { createRepository } from "../core";
import type { IRepositoryConfig } from "../types";
import { useWorkspaceSetup } from "./providers";


function createWorkspace<D = any>(){
    const { repositories, store, logger, observer, allRepositories, dependencies } = useWorkspaceSetup<D>();
    repositories.forEach((repository: IRepositoryConfig<D, any>) => {
        const { id } = repository;
        if (store.hasState(id)) return;
        store.setState(id, createRepository(repository))
    });
    return {
        logger: logger,
        store: store,
        observer: observer,
        allRepositories: allRepositories,
        dependencies: dependencies,
    }

}

export { createWorkspace };