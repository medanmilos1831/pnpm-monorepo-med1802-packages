import type { IRepositoryConfig } from "./types";

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
        repository = new Proxy(definition(infrastructure) as object, {
          get(target, prop) {
            if (typeof target[prop as keyof typeof target] === "function") {
              const originalMethod = target[prop as keyof typeof target] as (
                ...args: any[]
              ) => any;

              if (!config?.middlewares || config.middlewares.length === 0) {
                return originalMethod;
              }

              return (...args: any[]) => {
                let index = 0;
                const next = (...nextArgs: any[]) => {
                  if (index >= config.middlewares!.length) {
                    return originalMethod.apply(
                      target,
                      nextArgs.length > 0 ? nextArgs : args
                    );
                  }
                  const middleware = config.middlewares![index++];
                  return middleware(
                    target,
                    prop as string,
                    nextArgs.length > 0 ? nextArgs : args,
                    next
                  );
                };
                return next();
              };
            }
            return target[prop as keyof typeof target];
          },
        });
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
