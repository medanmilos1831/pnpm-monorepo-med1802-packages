import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { createLogger } from "./logger";

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
  const logger = createLogger(log, id);
  return {
    id,
    setState(callback: (params: S) => S) {
      state = callback(state);
      let decoratedPublish = logger.logAction(messageBroker.publish, state);
      decoratedPublish({
        eventName: "setState",
      });
    },
    getState() {
      return state;
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
