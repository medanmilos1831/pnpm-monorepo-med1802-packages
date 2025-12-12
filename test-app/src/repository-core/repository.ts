import { createStore } from "./store";
import type { StoreModel } from "./types";

function createRepository<S, C = any>({
  log = false,
  createState,
  createContext,
}: {
  log: boolean;
  createState: (params: S) => S;
  createContext: (store: ReturnType<typeof createStore<S>>) => C;
}) {
  const repositoryStore = createStore<Map<string, StoreModel<C>>>({
    id: "repository",
    state: new Map<string, StoreModel<C>>(),
    log: false,
  });
  return {
    createContext: (params: { id: string; initialState: S }) => {
      if (repositoryStore.getState().has(params.id)) {
        return;
      }
      repositoryStore.setState((prev) => {
        const store = createStore<S>({
          id: params.id,
          state: createState(params.initialState),
          log,
        });
        const context = createContext(store);
        let proto = Object.create({ context: store });
        Object.assign(proto, context);
        prev.set(params.id, {
          context: Object.assign(proto, context),
        });
        return prev;
      });
      console.log(repositoryStore.getState());
    },
    getContext: (id: string) => {
      return repositoryStore.getState().get(id)?.context! as C & {
        context: ReturnType<typeof createStore<S>>;
      };
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
