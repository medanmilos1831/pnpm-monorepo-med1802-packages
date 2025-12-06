import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import { createModelLogger } from "../infrastructure/logger/modellogger";
import { createMessageContainer } from "../infrastructure/messageContainer";
import { createMiddleware } from "../infrastructure/middleware";
import { type storeConfig, type toggleConfigType } from "../types";

const createModelContext = (params: toggleConfigType, config: storeConfig) => {
  let initialState = params.initialState;
  // INFRASTRUCTURE
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  createModelLogger(params.id, config.log, messageBroker);
  const messageContainer = createMessageContainer(messageBroker);
  const middleware = config.middlewares
    ? createMiddleware(config.middlewares, messageBroker, messageContainer)
    : undefined;
  // END :: INFRASTRUCTURE
  // Message Container
  const getMessage = messageContainer.getMessage;
  // Message Broker
  const publish = messageBroker.publish;
  const subscribe = messageBroker.subscribe;

  // Initial State
  function setInitialState(state: boolean) {
    initialState = state;
  }
  function getInitialState() {
    return initialState;
  }

  return {
    scopedObserver,
    middleware,
    setInitialState,
    getInitialState,
    getMessage,
    publish,
    subscribe,
  };
};

export { createModelContext };
