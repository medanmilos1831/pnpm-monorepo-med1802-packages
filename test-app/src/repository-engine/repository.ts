import { createStore } from "./store";
import type { StoreModel } from "./types";

function createRepository<S>({
  name,
  log = false,
  createState,
  repo,
}: {
  name: string;
  log: boolean;
  createState: (params: S) => S;
  repo: (params: S) => Record<string, () => void>;
}) {
  const repositoryStore = createStore<
    Map<string, StoreModel<ReturnType<typeof createStore<S>>>>
  >({
    id: name,
    state: new Map<string, StoreModel<ReturnType<typeof createStore<S>>>>(),
    log: false,
  });
  const repository = {
    ...repositoryStore,
    repo,
  };
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
