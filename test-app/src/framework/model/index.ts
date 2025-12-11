import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { createModelLogger } from "./modellogger";

function createStore<S>(state: S) {
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  return {
    setState(callback: (params: S) => S) {
      state = callback(state);
      messageBroker.publish({
        eventName: "setState",
      });
    },
    getStateByProp(prop: keyof S) {
      return () => state[prop];
    },
    subscribe(selector: (payload: any) => void) {
      return messageBroker.subscribe({
        eventName: "setState",
        callback: () => {
          selector(state);
        },
      });
    },
  };
}

function createModel<S = any>({
  modelId,
  state,
  log,
}: {
  modelId: string;
  state: S;
  log: boolean;
}) {
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  return {
    publish: messageBroker.publish,
    subscribe: messageBroker.subscribe,
    interceptor: messageBroker.interceptor,
    logger: createModelLogger(log, modelId),
    store: createStore<S>(state),
  };
}

export { createModel };
