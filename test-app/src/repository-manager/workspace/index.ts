import type { IConfiguration } from "./types";
import { createRepositoryModule, type IRepositoryInstance } from "./modules";
import {
  createScope,
  createLogger,
  createStore,
  useScope,
} from "./infrastructure";
import { repositoryScope } from "./providers";

function createWorkspace<I>(infrastructure: I, config: IConfiguration) {
  const defaultConfig: IConfiguration = {
    id: config.id,
    logging: config.logging ?? false,
  };
  const logger = createLogger(defaultConfig);
  const store = createStore<IRepositoryInstance<any>>();
  let repositoryModule!: ReturnType<typeof createRepositoryModule<I>>;
  repositoryScope.provider({
    value: {
      store,
      logger,
      infrastructure,
    },
    children: () => {
      repositoryModule = createRepositoryModule<I>();
    },
  });

  return {
    defineRepository: repositoryModule.defineRepository,
    queryRepository: repositoryModule.queryRepository,
    createScope,
    useScope,
  };
}

export { createWorkspace };
