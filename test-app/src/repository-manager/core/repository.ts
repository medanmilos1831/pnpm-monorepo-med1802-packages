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
                dispatch: (eventName: string, payload: any) => {
                  console.log("DISPATCH", eventName, payload);
                },
                subscribe: (
                  eventName: string,
                  callback: (payload: any) => void
                ) => {
                  console.log("SUBSCRIBE", eventName, callback);
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
        if (onDisconnect) {
          onDisconnect();
        }
      }
    },
  };
}

export { createRepository };
