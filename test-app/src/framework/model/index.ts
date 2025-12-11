import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { createModelLogger } from "./modellogger";

function createStore<S>({
  id,
  state,
  log,
}: {
  id: string;
  state: S;
  log: boolean;
}) {
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  const modelLogger = createModelLogger(log, id);
  return {
    setState(callback: (params: S) => S) {
      state = callback(state);
      let r = modelLogger.logAction(messageBroker.publish, state);
      r({
        eventName: "setState",
        payload: undefined,
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
export { createStore };
