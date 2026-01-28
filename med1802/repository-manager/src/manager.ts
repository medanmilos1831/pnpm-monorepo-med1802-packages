import type { IWorkspaceConfig } from "./types";
import { createWorkspace, createWorkspaceClient, setupWorkspaceProvider, workspaceProvider } from "./workspace";


const repositoryManager = () => {
  return {
    workspaceClient<D>(config: IWorkspaceConfig<D>) {
      let client: ReturnType<typeof createWorkspaceClient<D>>;

      setupWorkspaceProvider(config, () => {

          let workspace = createWorkspace();

          workspaceProvider<D>(workspace, () => {
            client = createWorkspaceClient<D>();
          });

      });

      return client!;
    },
  };
};

export { repositoryManager };
