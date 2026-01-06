import { createStore } from "../store";
import type { IContextConfig, IContextProviderOptions } from "./types";

function createContext<V = any>(config: IContextConfig<V>) {
  const store = createStore<IContextConfig<any>[]>();
  store.setState("stack", []);
  const stack = store.getState("stack");
  let _currentValue: any = null;
  function provider(options: IContextProviderOptions) {
    const { value, children } = options;
    _currentValue = value;
    // console.log("RUN PROVIDER AFTER OVERRIDE", currentValue);
    const stack = store.getState("stack");
    if (!stack) {
      throw new Error("Context stack not found");
    }
    try {
      children();
    } finally {
    }
    // try {
    //   stack.push(value ? { ...config, value } : config);
    //   // console.log("stack", stack);
  }
  return {
    provider,
    get currentValue() {
      return _currentValue;
    },
  };
}
function useCtx(ctx: ReturnType<typeof createContext>) {
  return ctx.currentValue;
}
export { createContext, useCtx };
