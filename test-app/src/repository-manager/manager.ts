import type { IWorkspaceConfig } from "./types";
import { createWorkspaceClient, mountWorkspace, workspaceProvider } from "./workspace";

const repositoryManager = () => {
  return {
    createWorkspace<D>(config: IWorkspaceConfig<D>) {
      let client: ReturnType<typeof createWorkspaceClient<D>> = undefined!;
      workspaceProvider<D>(mountWorkspace<any>(config), () => {
        client = createWorkspaceClient<D>();
      });
      return client;
    },
  };
};

export { repositoryManager };
