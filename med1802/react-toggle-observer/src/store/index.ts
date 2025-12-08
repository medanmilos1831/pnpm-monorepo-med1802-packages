import { createStoreLogger } from "../infrastructure/logger/storeLogger";
import type { storeConfig, StoreModel } from "../types";

function createStore<T, A extends { id: string; initialState: any }>(
  config: storeConfig,
  {
    defineModel,
  }: {
    defineModel(params: A, config: storeConfig): T;
  }
) {
  const store = new Map<string, StoreModel<T>>();
  const { logStore } = createStoreLogger(store, config.log);
  return {
    createModel: logStore((params: A) => {
      if (store.has(params.id)) return;
      store.set(params.id, {
        model: defineModel(params, config),
      });
    }),
    getModel: (id: string) => {
      if (!store.has(id)) {
        throw new Error(`Toggle ${id} not found`);
      }
      const model = store.get(id)!.model;
      return model;
    },
    hasModel: (id: string) => {
      return store.has(id);
    },
    deleteModel: (id: string) => {
      logStore(() => {
        store.delete(id);
      });
    },
  };
}

export { createStore };
