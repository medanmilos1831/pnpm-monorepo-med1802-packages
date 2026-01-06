import { createStore } from "../store";
import type { IContextConfig, IContextProviderOptions } from "./types";

function createContext<V = any>(defaultValue: V) {
  const store = createStore<IContextConfig<any>[]>();
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
function useCtx(ctx: ReturnType<typeof createContext>) {
  return ctx.currentValue;
}
export { createContext, useCtx };
