import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { StoreEventType } from "../types";

function createStore<S>({ id, state }: { id: string; state: S }) {
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  return {
    id,
    setState(callback: (params: S) => S) {
      state = callback(state);
      messageBroker.publish({
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
