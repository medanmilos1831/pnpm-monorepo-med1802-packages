import { createModel } from "../model";
import type { StoreModel, storeType } from "../types";

function createRepository<I, S, M>({
  log,
  model,
  store,
}: {
  log: boolean;
  model: (context: ReturnType<typeof createModel<I, S>>) => M;
  store: storeType<I, S>;
}) {
  const repository = new Map<string, StoreModel<M>>();

  return {
    createModel(params: { id: string; initialState: I }) {
      const context = createModel<I, S>({
        modelId: params.id,
        initialState: params.initialState,
        store,
        log,
      });
      model(context);

      if (repository.has(params.id)) return;
      repository.set(params.id, {
        model: model(context),
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
