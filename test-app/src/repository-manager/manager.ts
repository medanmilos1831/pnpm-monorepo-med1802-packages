import { createRepositoryModule } from "./repository";
import { createWorkspace as mount, type IConfiguration } from "./workspace";

const repositoryManager = () => {
  return {
    createWorkspace<I>(config: IConfiguration<I>) {
      let client: ReturnType<typeof createRepositoryModule<I>> = undefined!;
      mount<I>(config, () => {
        client = createRepositoryModule<I>();
      });
      return client;
    },
  };
};

export { repositoryManager };
