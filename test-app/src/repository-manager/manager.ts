import type { IWorkspaceConfig } from "./types";
import { createWorkspaceClient, setup, workspaceProvider } from "./workspace";

const repositoryManager = () => {
  return {
    createWorkspace<D>(config: IWorkspaceConfig<D>) {
      let workspace = setup<D>(config);
      let client: ReturnType<typeof createWorkspaceClient<D>> = undefined!;

      workspaceProvider<D>(workspace, () => {
        client = createWorkspaceClient<D>();
      });
      return client;
    },
  };
};

export { repositoryManager };
