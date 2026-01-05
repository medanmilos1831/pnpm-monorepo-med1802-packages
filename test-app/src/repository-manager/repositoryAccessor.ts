import { applyMiddleware } from "./middleware";
import type { Middleware } from "./types";

function createRepositoryAccessor<I extends Record<string, any>>(
  definition: (infrastructure: I) => unknown,
  infrastructure: I,
  config: {
    middlewares?: Middleware[];
    onConnect?: () => void;
    onDisconnect?: () => void;
  }
) {
  let repository = undefined as unknown;
  let connections = 0;
  const { middlewares, onConnect, onDisconnect } = config;
  const obj = {
    get repository() {
      return repository;
    },
    get connections() {
      return connections;
    },
    connect() {
      if (connections === 0) {
        const rawRepository = definition(infrastructure);
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

  return obj;
}

export { createRepositoryAccessor };
