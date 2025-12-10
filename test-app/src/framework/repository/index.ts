import { createModel } from "../model";
import type { StoreModel, storeType } from "../types";

function createRepository<I, S, M, MI>({
  log,
  middlewares,
  model,
  store,
}: {
  log: boolean;
  middlewares?: {
    [key: string]: (params: {
      resolve: (callback: (value: any, payload: any) => MI) => void;
      reject: () => void;
    }) => void;
  };
  model: (context: ReturnType<typeof createModel<I, S>>) => M;
  store: storeType<I, S>;
}) {
  const repository = new Map<string, StoreModel<M>>();

  return {
    createModel(params: { id: string; initialState: I }) {
      const context = createModel<I, S, MI>({
        modelId: params.id,
        initialState: params.initialState,
        store,
        middlewares,
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
