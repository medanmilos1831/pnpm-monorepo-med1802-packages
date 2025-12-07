import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { createModelLogger } from "../infrastructure/logger/modellogger";
import { createMiddleware } from "../infrastructure/middleware";
import { type storeConfig } from "../types";
import { createModelStore } from "../infrastructure/modelStore";

const createModelContext = (config: storeConfig, id: string) => {
  // INFRASTRUCTURE
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  const { logAction } = createModelLogger(config.log, id);
  const modelState = createModelStore();
  const middleware = config.middlewares
    ? createMiddleware(config.middlewares, messageBroker)
    : undefined;
  const getValue = modelState.getState("open");
  const getMessage = modelState.getState("message");
  const setState = modelState.setState;
  // END :: INFRASTRUCTURE
  return {
    scopedObserver,
    middleware,
    setState,
    getValue,
    getMessage,
    logAction,
    publish: messageBroker.publish,
    subscribe: messageBroker.subscribe,
  };
};

export { createModelContext };
