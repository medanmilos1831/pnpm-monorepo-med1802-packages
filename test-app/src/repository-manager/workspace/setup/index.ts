import type { IWorkspaceConfig } from "../../types";
import { createInventory } from "./invetory";
import { mount } from "./mount";

function setup<D = any>(config: IWorkspaceConfig<D>){
    const { repositories, scopes } = mount(config.onMount); 
    const { run } = createInventory(config, scopes);
    const { logger, store, observer, allRepositories, dependencies } = run(repositories);
    return {
        allRepositories,
        dependencies,
        logger,
        store,
        observer,
    };
}

export { setup };
