import type { createStore } from "../../infrastructure";
import type { IContextConfig, IContextProviderOptions } from "./types";

function createContextServices({
  contextStore,
}: {
  contextStore: ReturnType<typeof createStore<IContextConfig<any>[]>>;
}) {
  function createContext<V = any>(config: IContextConfig<V>) {
    return {
      provider(options: IContextProviderOptions) {
        const { value, children } = options;
        const stack = contextStore.getState("stack");
        if (!stack) {
          throw new Error("Context stack not found");
        }
        try {
          stack.push(value ? { ...config, value } : config);
          children();
        } finally {
          stack.pop();
        }
      },
    };
  }
  return {
    createContext,
  };
}
export { createContextServices };
