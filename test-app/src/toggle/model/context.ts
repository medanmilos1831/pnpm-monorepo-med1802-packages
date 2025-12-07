import { EventName, type onChangePayload } from "../types";
import { createInfrastructure } from "./createInfrastructure";

const createModelContext = (
  infrastructure: ReturnType<typeof createInfrastructure>
) => {
  const { modelState, messageBroker, logger, middleware } = infrastructure;
  const isOpen = modelState.getStateByProp("open") as () => boolean;
  const getMessage = modelState.getStateByProp("message");
  const setState = modelState.setState;
  function publishHandler(payload: onChangePayload) {
    setState((state) => ({
      ...state,
      ...payload,
    }));

    const decoratedPublish = logger.logAction(messageBroker.publish, payload);
    decoratedPublish({
      eventName: EventName.ON_CHANGE,
      payload,
    });
  }
  return {
    getMessage,
    middleware,
    isOpen,
    subscribe: messageBroker.subscribe,
    publishHandler,
  };
};

export { createModelContext };
