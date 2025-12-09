import type { StoreModel } from "./types";

function createRepository<T, A extends { id: string; initialState: any }>(
  config: any,
  { defineModel }: any
) {
  const repository = new Map<string, StoreModel<T>>();
  return {
    createModel: (params: A) => {
      if (repository.has(params.id)) return;
      repository.set(params.id, {
        model: defineModel(params, config),
      });
    },
    getModel: (id: string) => {
      if (!repository.has(id)) {
        throw new Error(`Toggle ${id} not found`);
      }
      const model = repository.get(id)!.model;
      return model;
    },
    hasModel: (id: string) => {
      return repository.has(id);
    },
    deleteModel: (id: string) => {
      repository.delete(id);
    },
  };
}

export { createRepository };
