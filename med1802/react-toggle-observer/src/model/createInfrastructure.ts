import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { createModelLogger } from "../infrastructure/logger/modellogger";
import { createModelStore } from "../infrastructure/modelStore";
import type { storeConfig } from "../types";
import { createMiddleware } from "../infrastructure/middleware";

const createInfrastructure = (config: storeConfig, id: string) => {
  // INFRASTRUCTURE
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  const logger = createModelLogger(config.log, id);
  const modelState = createModelStore();
  const middleware = config.middlewares
    ? createMiddleware(config.middlewares, messageBroker, modelState)
    : undefined;
  // END :: INFRASTRUCTURE
  return {
    scopedObserver,
    messageBroker,
    logger,
    middleware,
    modelState,
  };
};

export { createInfrastructure };
