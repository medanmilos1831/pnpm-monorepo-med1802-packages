import { createStore } from "../store";
import type { IContextConfig, IContextProviderOptions } from "./types";

function createContext<V = any>(config: IContextConfig<V>) {
  const store = createStore<IContextConfig<any>[]>();
  function provider(options: IContextProviderOptions) {
    const { value, children } = options;
    const stack = store.getState("stack");
    if (!stack) {
      throw new Error("Context stack not found");
    }
    try {
      stack.push(value ? { ...config, value } : config);
      children();
    } finally {
      stack.pop();
    }
  }
  return provider;
}
export { createContext };
