import type { IRepositoryInstance } from "./types";

function createGlobalStore<S>() {
  const state = new Map<string, S>();
  return {
    setState(id: string, item: S) {
      state.set(id, item);
    },
    getState(id: string) {
      return state.get(id);
    },
    hasState(id: string) {
      return state.has(id);
    },
    deleteState(id: string) {
      state.delete(id);
    },
    getEntries() {
      return state.entries();
    },
  };
}
export { createGlobalStore };
