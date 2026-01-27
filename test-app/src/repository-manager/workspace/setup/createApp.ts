import { createRepository } from "../../core";
import type { IRepositoryConfig } from "../../types";
import { useSetup } from "./context";

function createApp<D = any>(){
    const { repositories, store, logger, observer, allRepositories, dependencies } = useSetup<D>();
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

export { createApp };