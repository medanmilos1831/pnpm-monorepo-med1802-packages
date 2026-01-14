import { createRepositoryModule } from "./repository";
import { createWorkspace, type IConfiguration } from "./workspace";

const repositoryManager = () => {
  return {
    createWorkspace<I>(infrastructure: I, config: IConfiguration) {
      let client: ReturnType<typeof createRepositoryModule<I>> = undefined!;
      createWorkspace(
        {
          config,
          infrastructure,
        },
        () => {
          client = createRepositoryModule<I>();
        }
      );
      return client;
    },
  };
};

export { repositoryManager };
