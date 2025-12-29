import type { IRepositoryConfig } from "./types";
import { applyMiddleware } from "./middleware";

function createRepositoryAccessor<I extends Record<string, any>>(
  definition: (infrastructure: I) => unknown,
  infrastructure: I,
  config?: IRepositoryConfig
) {
  let repository = undefined as unknown;
  let connections = 0;

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
        repository = config?.middlewares
          ? applyMiddleware(rawRepository, config.middlewares)
          : rawRepository;
        if (config?.lifecycle?.onConnect) {
          config.lifecycle.onConnect();
        }
      }
      connections += 1;
    },
    disconnect() {
      if (connections === 0) return;
      connections -= 1;
      if (connections === 0) {
        repository = undefined;
        if (config?.lifecycle?.onDisconnect) {
          config.lifecycle.onDisconnect();
        }
      }
    },
  };

  return obj;
}

export { createRepositoryAccessor };
