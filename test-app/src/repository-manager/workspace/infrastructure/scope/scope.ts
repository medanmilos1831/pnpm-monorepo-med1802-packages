import type { IScope } from "./types";

function createScope<V = any>(
  defaultValue: V
): IScope<V> & { currentValue: V } {
  const stack: V[] = [];
  function provider(initialValue: V, children: () => void) {
    if (!stack) {
      throw new Error("Scope stack not found");
    }
    try {
      stack.push(initialValue ? initialValue : defaultValue);
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
