import type { IWorkspaceConfig } from "./types";
import { createWorkspaceContext } from "./workspace";
import { createWorkspaceClient } from "./workspace/client";

const repositoryManager = () => {
  return {
    createWorkspace<I>(config: IWorkspaceConfig<I>) {
      let client: ReturnType<typeof createWorkspaceClient<I>> = undefined!;
      createWorkspaceContext<I>(config, () => {
        client = createWorkspaceClient<I>();
      });
      return client;
    },
  };
};

export { repositoryManager };
