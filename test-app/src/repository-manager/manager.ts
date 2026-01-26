import type { IRepositoryConfig, IWorkspaceConfig } from "./types";
import { createWorkspaceClient, mountWorkspace, workspaceProvider } from "./workspace";

const repositoryManager = () => {
  return {
    createWorkspace<D>(config: IWorkspaceConfig<D>, defineRepository: (obj: {
      useRepository<R>(repository: IRepositoryConfig<D, R>): void
    }) => void) {
      let repos: IRepositoryConfig<D, any>[] = [];
        defineRepository({
          useRepository<R>(repository: IRepositoryConfig<D, R>){
            repos.push(repository);
          } 
        });
      let client: ReturnType<typeof createWorkspaceClient<D>> = undefined!;
      workspaceProvider<D>(mountWorkspace<any>(config, repos), () => {
        client = createWorkspaceClient<D>();
      });
      return client;
    },
  };
};

export { repositoryManager };
