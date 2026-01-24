import type { Middleware } from "../types";

export function applyMiddleware(repository: any, middlewares: Middleware[]) {
  if (!middlewares || middlewares.length === 0) {
    return repository;
  }

  return new Proxy(repository, {
    get(target, prop) {
      if (typeof target[prop as keyof typeof target] === "function") {
        const originalMethod = target[prop as keyof typeof target] as (
          ...args: any[]
        ) => any;

        return (...args: any[]) => {
          let index = 0;
          const next = (...nextArgs: any[]) => {
            if (index >= middlewares.length) {
              return originalMethod.apply(
                target,
                nextArgs.length > 0 ? nextArgs : args
              );
            }
            const middleware = middlewares[index++];
            return middleware(
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
}
