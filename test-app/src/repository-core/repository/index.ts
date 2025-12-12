import { createStore } from "../store";
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
  const repositoryStore = createStore<Map<string, StoreModel<M>>>({
    id: "repository",
    state: new Map<string, StoreModel<M>>(),
    log: false,
  });
  return {
    createModel: (params: { id: string; initialState: S }) => {
      repositoryStore.setState((prev) => {
        prev.set(params.id, {
          model: model(
            createStore<S>({
              id: params.id,
              state: createState(params.initialState),
              log,
            })
          ),
        });
        return prev;
      });
      console.log(repositoryStore.getState());
    },
    getModel: (id: string) => {
      return repositoryStore.getState().get(id)?.model!;
    },
    hasModel: (id: string) => {
      return repositoryStore.getState().has(id);
    },
    deleteModel: (id: string) => {
      repositoryStore.setState((prev) => {
        prev.delete(id);
        return prev;
      });
    },
    subscribe: (callback: (payload: any) => void) => {
      return repositoryStore.subscribe(callback);
    },
  };
}

export { createRepository };
