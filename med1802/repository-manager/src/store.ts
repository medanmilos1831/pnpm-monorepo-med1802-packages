import type { IRepositoryInstance } from "./types";
function createStore() {
  const state = new Map<string, IRepositoryInstance>();
  return {
    setRepository(id: string, repository: IRepositoryInstance) {
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
