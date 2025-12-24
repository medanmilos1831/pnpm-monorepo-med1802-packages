function createStore<S>() {
  const state = new Map<string, S>();
  return {
    setState(id: string, params: S) {
      state.set(id, params);
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
    entries() {
      return state.entries();
    },
  };
}

export { createStore };
