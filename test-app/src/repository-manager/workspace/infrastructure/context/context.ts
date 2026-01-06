import { createStore } from "../store";
import type { IContextConfig, IContextProviderOptions } from "./types";

function createContext<V = any>(config: IContextConfig<V>) {
  const store = createStore<IContextConfig<any>[]>();
  store.setState("stack", []);
  const stack = store.getState("stack");
  let _defaultValue = config.value;
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
  return {
    provider,
    get currentValue() {
      let last = stack?.length ? stack[stack.length - 1] : null;
      return last?.value ? last.value : _defaultValue;
    },
  };
}
function useCtx(ctx: ReturnType<typeof createContext>) {
  return ctx.currentValue;
}
export { createContext, useCtx };
