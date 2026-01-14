import { createRepositoryModule } from "./modules";
function createWorkspace<I>() {
  let repositoryModule = createRepositoryModule<I>();

  return {
    defineRepository: repositoryModule.defineRepository,
    queryRepository: repositoryModule.queryRepository,
  };
}

export { createWorkspace };
