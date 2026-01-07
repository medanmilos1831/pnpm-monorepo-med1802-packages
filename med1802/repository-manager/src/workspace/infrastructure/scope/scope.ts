import { createStore } from "../store";
import type { IScope, IScopeProviderOptions } from "./types";

function createScope<V = any>(
  defaultValue: V
): IScope<V> & { currentValue: V } {
  const store = createStore<V[]>();
  store.setState("stack", []);
  const stack = store.getState("stack");
  function provider(options: IScopeProviderOptions) {
    const { value, children } = options;
    const stack = store.getState("stack");
    if (!stack) {
      throw new Error("Scope stack not found");
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
function useScope<V = any>(ctx: IScope<V>) {
  const scope = ctx as IScope<V> & { currentValue: V };
  return scope.currentValue;
}
export { createScope, useScope };
