import { useScope } from "../../infrastructure";
import { applyMiddleware } from "./middleware";
import type { IRepositoryPlugin } from "./types";

function createRepositoryAccessor<I>(
  infrastructure: I,
  repositoryPlugin: IRepositoryPlugin<I, any>
) {
  const { install, middlewares, onConnect, onDisconnect } = repositoryPlugin;
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
        const rawRepository = install({
          instance: { infrastructure, useScope },
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

  return obj;
}

export { createRepositoryAccessor };
