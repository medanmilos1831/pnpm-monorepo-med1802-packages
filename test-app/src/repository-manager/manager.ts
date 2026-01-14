import { createRepositoryModule } from "./repository";
import { mountWorkspace, type IConfiguration } from "./workspace";

const repositoryManager = () => {
  return {
    workspace<I>(infrastructure: I, config: IConfiguration) {
      let client: ReturnType<typeof createRepositoryModule<I>> = undefined!;
      mountWorkspace(
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
