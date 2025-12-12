import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { createLogger } from "./logger";
import { StoreEventType } from "../types";

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
    setState(callback: (params: S) => S) {
      state = callback(state);
      let decoratedPublish = logger.logAction(messageBroker.publish, state);
      decoratedPublish({
        eventName: StoreEventType.SET_STATE,
      });
    },
    getState() {
      return state;
    },
    subscribe(selector: (payload: any) => void) {
      return messageBroker.subscribe({
        eventName: StoreEventType.SET_STATE,
        callback: () => {
          selector(state);
        },
      });
    },
  };
}
export { createStore };
