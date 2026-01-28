import type { IRepositoryConfig } from "../types";
import { useWorkspaceSetup } from "../workspace";

import { createSignalBroadcaster } from "./createSignalBroadcaster";
import { applyMiddleware } from "./middleware";

function createRepository<D>(
  repositoryConfig: IRepositoryConfig<D, any>,
) {

  const { dependencies, observer } = useWorkspaceSetup<D>()
  const { install, middlewares, onConnect, onDisconnect } = repositoryConfig;
  let repository = undefined as unknown;
  let connections = 0;
  let unsubscribe = () => {};
  const { signal, subscribe } = createSignalBroadcaster({
    observer,
    repositoryConfig,
  });

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
            signal,
          },
        });
        repository = middlewares
          ? applyMiddleware(rawRepository, middlewares)
          : rawRepository;
        if (onConnect) {
          onConnect();
        }
        if(repositoryConfig.onSignal) {
          unsubscribe = subscribe((payload) => {
            repositoryConfig.onSignal!(payload, repository);
          });
        }
      }
      connections += 1;
    },
    disconnect() {
      if (connections === 0) return;
      connections -= 1;
      if (connections === 0) {
        repository = undefined;
        unsubscribe();
        unsubscribe = () => {};
        if (onDisconnect) {
          onDisconnect();
        }
      }
    },
  };
}

export { createRepository };
