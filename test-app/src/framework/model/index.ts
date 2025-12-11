import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import type { storeType } from "../types";
import { createModelLogger } from "./modellogger";

function createModel<I = any, S = any>({
  modelId,
  initialState,
  store,
  log,
}: {
  modelId: string;
  initialState: I;
  store: storeType<I, S>;
  log: boolean;
}) {
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  return {
    publish: messageBroker.publish,
    subscribe: messageBroker.subscribe,
    logger: createModelLogger(log, modelId),
    store: store({
      id: modelId,
      initialState,
    }),
  };
}

export { createModel };
