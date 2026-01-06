import { createStore } from "../store";
import type { IContextProviderOptions } from "./types";

interface IContext<V = any> {
  provider(options: IContextProviderOptions<V>): void;
  get currentValue(): V;
}

function createContext<V = any>(defaultValue: V): IContext<V> {
  const store = createStore<V[]>();
  store.setState("stack", []);
  const stack = store.getState("stack");
  function provider(options: IContextProviderOptions) {
    const { value, children } = options;
    const stack = store.getState("stack");
    if (!stack) {
      throw new Error("Context stack not found");
    }
    try {
      stack.push(value ? value : defaultValue);
      children();
    } finally {
      stack.pop();
    }
  }
  return {
    provider,
    get currentValue() {
      let last = stack?.length ? stack[stack.length - 1] : null;
      return last ? last : defaultValue;
    },
  };
}
function useCtx<V = any>(ctx: IContext<V>) {
  return ctx.currentValue;
}
export { createContext, useCtx };
