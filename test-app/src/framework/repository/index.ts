import { createModel } from "../model";
import type { StoreModel } from "../types";

function createRepository<IS, S, M>({
  log,
  createState,
  model,
}: {
  log: boolean;
  createState: (params: IS) => S;
  model: (context: ReturnType<typeof createModel<S>>) => M;
}) {
  const repository = new Map<string, StoreModel<M>>();

  return {
    createModel(params: { id: string; initialState: IS }) {
      const context = createModel<S>({
        modelId: params.id,
        state: createState(params.initialState),
        log,
      });

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
