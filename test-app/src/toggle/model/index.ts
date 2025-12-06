import { createModelContext } from "./context";
import {
  EventName,
  type IEvent,
  type storeConfig,
  type toggleConfigType,
} from "../types";

const model = (params: toggleConfigType, config: storeConfig) => {
  const context = createModelContext(params, config);
  const {
    setMessage,
    getMessage,
    middleware,
    getInitialState,
    setInitialState,
    publish,
    subscribe,
    logAction,
  } = context;
  function publishHandler(payload: { open: boolean; message?: any }) {
    const { open, message } = payload;
    setMessage(message);
    setInitialState(open);
    publish({
      eventName: EventName.ON_CHANGE,
      payload,
    });
    return {
      eventName: EventName.ON_CHANGE,
      payload,
    };
  }
  return {
    open: (message?: any) => {
      const decoratedPublishHandler = logAction(publishHandler);
      decoratedPublishHandler({
        open: true,
        message,
      });
    },
    close: (message?: any) => {
      const decoratedPublishHandler = logAction(publishHandler);
      decoratedPublishHandler({
        open: false,
        message,
      });
    },
    middleware,
    onChangeSync: (callback: () => void) => {
      return subscribe({
        eventName: EventName.ON_CHANGE,
        callback,
      });
    },
    onChange: (callback: (event: IEvent) => void) => {
      return subscribe({
        eventName: EventName.ON_CHANGE,
        callback,
      });
    },
    getMessage: getMessage,
    getValue: getInitialState,
  };
};

export { model };
