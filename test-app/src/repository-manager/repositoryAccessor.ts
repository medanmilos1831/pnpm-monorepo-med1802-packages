import type { IRepositoryConfig } from "./types";

function createRepositoryAccessor<I extends Record<string, any>>(
  definition: (infrastructure: I) => unknown,
  infrastructure: I,
  config?: IRepositoryConfig
) {
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
        repository = definition(infrastructure);
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
}

export { createRepositoryAccessor };
