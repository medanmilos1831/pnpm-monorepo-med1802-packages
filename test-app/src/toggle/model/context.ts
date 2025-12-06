import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { createModelLogger } from "../infrastructure/logger/modellogger";
import { createMiddleware } from "../infrastructure/middleware";
import { type storeConfig, type toggleConfigType } from "../types";
import { createModelState } from "../infrastructure/modelState";

const createModelContext = (params: toggleConfigType, config: storeConfig) => {
  // let initialState = params.initialState;
  // INFRASTRUCTURE
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  createModelLogger(config.log, messageBroker);
  const modelState = createModelState(messageBroker);
  const middleware = config.middlewares
    ? createMiddleware(config.middlewares, messageBroker)
    : undefined;
  // END :: INFRASTRUCTURE
  // Message Container
  const getMessage = modelState.getMessage;
  const getState = modelState.getState;
  // Message Broker
  const publish = messageBroker.publish;
  const subscribe = messageBroker.subscribe;

  // Initial State
  // function setInitialState(state: boolean) {
  //   initialState = state;
  // }
  // function getInitialState() {
  //   return initialState;
  // }

  return {
    scopedObserver,
    middleware,
    getState,
    getMessage,
    publish,
    subscribe,
  };
};

export { createModelContext };
