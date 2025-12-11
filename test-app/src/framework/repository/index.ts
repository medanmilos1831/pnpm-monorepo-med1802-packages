import { createStore } from "../model";
import type { StoreModel } from "../types";

function createRepository<S, M>({
  log,
  createState,
  model,
}: {
  log: boolean;
  createState: (params: S) => S;
  model: (context: ReturnType<typeof createStore<S>>) => M;
}) {
  const repository = new Map<string, StoreModel<M>>();

  return {
    createModel(params: { id: string; initialState: S }) {
      if (repository.has(params.id)) return;
      repository.set(params.id, {
        model: model(
          createStore<S>({
            id: params.id,
            state: createState(params.initialState),
            log,
          })
        ),
      });
    },
    getModel: (id: string) => {
      if (!repository.has(id)) {
        throw new Error(`Model ${id} not found`);
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
