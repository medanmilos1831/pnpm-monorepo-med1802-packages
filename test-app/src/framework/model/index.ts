import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
const createModel = () => {
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  return {
    publish: messageBroker.publish,
    subscribe: messageBroker.subscribe,
    middleware: () => () => {},
  };
};

export { createModel };
