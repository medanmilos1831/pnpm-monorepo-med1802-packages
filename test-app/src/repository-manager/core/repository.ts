import type { createScopedObserver } from "../infrastructure";
import { applyMiddleware } from "./middleware";
import type { IRepositoryPlugin } from "./types";

function createRepository<I>(
  infrastructure: I,
  repositoryPlugin: IRepositoryPlugin<I, any>,
  observer: ReturnType<typeof createScopedObserver>
) {
  const { install, middlewares, onConnect, onDisconnect } = repositoryPlugin;
  let repository = undefined as unknown;
  let connections = 0;
  let subscriptions: any = [];
  return {
    get repository() {
      return repository;
    },
    get connections() {
      return connections;
    },
    connect() {
      if (connections === 0) {
        const rawRepository = install({
          instance: {
            infrastructure,
            observer: (() => {
              return {
                dispatch: ({ scope, payload }: any) => {
                  if (scope === repositoryPlugin.id) {
                    console.warn("WARNING: DISPATCHING TO SELF");
                    return;
                  }
                  observer.dispatch({
                    scope,
                    eventName: "dispatch",
                    payload: {
                      data: payload,
                      source: repositoryPlugin.id,
                    },
                  });
                },
                subscribe: (callback: (payload: any) => void) => {
                  if (subscriptions.length > 0) {
                    console.warn("WARNING: SUBSCRIBED ALREADY");
                    return;
                  }
                  const unsubscribe = observer.subscribe({
                    scope: repositoryPlugin.id,
                    eventName: "dispatch",
                    callback({ payload }: any) {
                      callback({
                        data: payload.data,
                        source: payload.source,
                      });
                    },
                  });
                  subscriptions.push(unsubscribe);
                },
              };
            })(),
          },
        });
        repository = middlewares
          ? applyMiddleware(rawRepository, middlewares)
          : rawRepository;
        if (onConnect) {
          onConnect();
        }
      }
      connections += 1;
    },
    disconnect() {
      if (connections === 0) return;
      connections -= 1;
      if (connections === 0) {
        repository = undefined;
        subscriptions.forEach((unsubscribe: any) => unsubscribe());
        subscriptions = [];
        if (onDisconnect) {
          onDisconnect();
        }
      }
    },
  };
}

export { createRepository };
