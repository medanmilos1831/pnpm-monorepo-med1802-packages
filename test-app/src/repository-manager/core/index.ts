import type { IRepositoryConfig } from "../types";
import { useWorkspaceSetup } from "../workspace";

import { createMessenger } from "./messenger";
import { applyMiddleware } from "./middleware";

function createRepository<D>(
  repositoryConfig: IRepositoryConfig<D, any>,
) {

  const { dependencies, observer } = useWorkspaceSetup<D>()
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
            messenger: createMessenger({
              observer,
              subscriptions,
              repositoryConfig,
            }),
          },
        });
        repository = middlewares
          ? applyMiddleware(rawRepository, middlewares)
          : rawRepository;
        if (onConnect) {
          onConnect();
        }
        if(repositoryConfig.subscribe) {
          const unsubscribe = observer.subscribe({
            scope: repositoryConfig.id,
            eventName: "dispatch",
            callback({ payload }: any) {

              const { type, message, source } = payload;
              repositoryConfig.subscribe!({
                type,
                message: message ?? undefined,
                source,
              }, repository);
            },
          });
          subscriptions.push(unsubscribe);
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
