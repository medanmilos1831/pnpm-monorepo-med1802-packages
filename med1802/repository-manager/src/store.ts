import type { createRepositoryReference } from "./repositoryInstance";

type repositoryReferenceType = ReturnType<typeof createRepositoryReference>;
function createStore() {
  const state = new Map<string, repositoryReferenceType>();
  return {
    setRepository(id: string, repository: repositoryReferenceType) {
      state.set(id, repository);
    },
    getRepository(id: string) {
      return state.get(id);
    },
    hasRepository(id: string) {
      return state.has(id);
    },
    deleteRepository(id: string) {
      state.delete(id);
    },
    entries() {
      return state.entries();
    },
  };
}
export { createStore };
