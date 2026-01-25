import type { scopedObserverType } from "../infrastructure";
import type { IRepositoryConfig } from "../types";
import { applyMiddleware } from "./middleware";

function createRepository<D>(
  dependencies: D,
  repositoryConfig: IRepositoryConfig<D, any>,
  observer: scopedObserverType
) {
  const { install, middlewares, onConnect, onDisconnect } = repositoryConfig;
  let repository = undefined as unknown;
  let connections = 0;
  let subscriptions: (() => void)[] = [];
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
            dependencies,
            observer: (() => {
              return {
                dispatch: ({ repositoryId, type, message }) => {
                  if (repository === repositoryConfig.id) {
                    console.warn("WARNING: DISPATCHING TO SELF");
                    return;
                  }
                  observer.dispatch({
                    scope: repositoryId,
                    eventName: "dispatch",
                    payload: {
                      type,
                      message,
                      source: repositoryConfig.id,
                    },
                  });
                },
                subscribe: (handler) => {
                  if (subscriptions.length > 0) {
                    console.warn("WARNING: SUBSCRIBED ALREADY");
                    return;
                  }
                  const unsubscribe = observer.subscribe({
                    scope: repositoryConfig.id,
                    eventName: "dispatch",
                    callback({ payload }) {
                      const { type, message, source } = payload;
                      handler({
                        type,
                        message: message ?? undefined,
                        source,
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
        subscriptions.forEach((unsubscribe) => unsubscribe());
        subscriptions = [];
        if (onDisconnect) {
          onDisconnect();
        }
      }
    },
  };
}

export { createRepository };
