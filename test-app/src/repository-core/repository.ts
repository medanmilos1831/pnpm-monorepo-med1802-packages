import { createStore } from "./store";
import type { StoreModel } from "./types";

function createRepository<S>({
  log = false,
  createState,
}: {
  log: boolean;
  createState: (params: S) => S;
}) {
  const repositoryStore = createStore<
    Map<string, StoreModel<ReturnType<typeof createStore<S>>>>
  >({
    id: "repository",
    state: new Map<string, StoreModel<ReturnType<typeof createStore<S>>>>(),
    log: false,
  });
  return {
    createModel: (params: { id: string; initialState: S }) => {
      if (repositoryStore.getState().has(params.id)) {
        return;
      }
      repositoryStore.setState((prev) => {
        prev.set(params.id, {
          model: createStore<S>({
            id: params.id,
            state: createState(params.initialState),
            log,
          }),
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
