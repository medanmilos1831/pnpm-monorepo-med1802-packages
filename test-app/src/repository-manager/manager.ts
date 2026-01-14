import { createRepositoryClient } from "./core";
import { createWorkspace as mount, type IConfiguration } from "./workspace";

const repositoryManager = () => {
  return {
    createWorkspace<I>(config: IConfiguration<I>) {
      let client: ReturnType<typeof createRepositoryClient<I>> = undefined!;
      mount<I>(config, () => {
        client = createRepositoryClient<I>();
      });
      return client;
    },
  };
};

export { repositoryManager };
