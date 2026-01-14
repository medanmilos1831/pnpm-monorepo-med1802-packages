import { createWorkspace as mount, type IConfiguration } from "./workspace";
import { createWorkspaceClient } from "./workspace/client";

const repositoryManager = () => {
  return {
    createWorkspace<I>(config: IConfiguration<I>) {
      let client: ReturnType<typeof createWorkspaceClient<I>> = undefined!;
      mount<I>(config, () => {
        client = createWorkspaceClient<I>();
      });
      return client;
    },
  };
};

export { repositoryManager };
