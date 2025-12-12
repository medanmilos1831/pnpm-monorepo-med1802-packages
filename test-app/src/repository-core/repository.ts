import { createStore } from "./store";

function createRepository<S, C = any>({
  createState,
  commands,
}: {
  log: boolean;
  createState: (params: S) => S;
  commands: (store: ReturnType<typeof createStore<S>>["setState"]) => C;
}) {
  const repositoryStore = createStore<Map<string, C>>({
    id: "repository",
    state: new Map<string, C>(),
  });
  return {
    create: (params: { id: string; initialState: S }) => {
      if (repositoryStore.getState().has(params.id)) {
        return;
      }
      repositoryStore.setState((prev) => {
        const store = createStore<S>({
          id: params.id,
          state: createState(params.initialState),
        });
        const context = commands(store.setState);
        let proto = Object.create({
          subscribe: store.subscribe,
          getState: store.getState,
        });
        prev.set(params.id, Object.assign(proto, context));
        return prev;
      });
    },
    get: (id: string) => {
      return repositoryStore.getState().get(id)! as C & {
        subscribe: ReturnType<typeof createStore<S>>["subscribe"];
        getState: ReturnType<typeof createStore<S>>["getState"];
      };
    },
    has: (id: string) => {
      return repositoryStore.getState().has(id);
    },
    remove: (id: string) => {
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
