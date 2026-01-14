import { createScope, useScope } from "./infrastructure";
import { createRepositoryModule } from "./modules";
import { repositoryProvider } from "./providers";
import type { IConfiguration } from "./types";

function createWorkspace<I>(infrastructure: I, config: IConfiguration) {
  let repositoryModule!: ReturnType<typeof createRepositoryModule<I>>;
  repositoryProvider(
    {
      config,
      infrastructure,
    },
    () => {
      repositoryModule = createRepositoryModule<I>();
    }
  );
  return {
    defineRepository: repositoryModule.defineRepository,
    queryRepository: repositoryModule.queryRepository,
    createScope,
    useScope,
  };
}

export { createWorkspace };
