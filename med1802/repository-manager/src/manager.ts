import type { IWorkspaceConfig } from "./types";
import { workspaceProvider, mountWorkspace, createWorkspaceClient } from "./workspace";

const repositoryManager = () => {
  return {
    createWorkspace<I>(config: IWorkspaceConfig<I>) {
      let client: ReturnType<typeof createWorkspaceClient<I>> = undefined!;
      workspaceProvider<I>(mountWorkspace<any>(config), () => {
        client = createWorkspaceClient<I>();
      });
      return client;
    },
  };
};

export { repositoryManager };
