import type { IRepositoryConfig, IWorkspaceConfig } from "../../types";

function mount<D = any>(onMount: IWorkspaceConfig<D>['onMount']){
    const repositories: IRepositoryConfig<D, any>[] = [];
    onMount({
        useRepository<R>(repository: IRepositoryConfig<D, R>){
            repositories.push(repository);
        }
    });
    return {
        repositories,
        scopes: repositories.map((repository) => ({ scope: repository.id })),
    };
}

export { mount };