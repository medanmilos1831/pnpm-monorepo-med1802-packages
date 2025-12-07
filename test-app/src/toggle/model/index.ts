import { createModelContext } from "./context";
import {
  EventName,
  type IEvent,
  type onChangePayload,
  type storeConfig,
  type toggleConfigType,
} from "../types";

const model = (params: toggleConfigType, config: storeConfig) => {
  const context = createModelContext(config, params.id);
  const {
    getMessage,
    middleware,
    getValue,
    publish,
    subscribe,
    setState,
    logAction,
  } = context;
  function publishHandler(payload: onChangePayload) {
    setState((state) => ({
      ...state,
      ...payload,
    }));
    publish({
      eventName: EventName.ON_CHANGE,
      payload,
    });
  }
  return {
    open: (message?: any) => {
      const payload = {
        open: true,
        message,
      };
      const decoratedPublish = logAction(publishHandler, payload);
      decoratedPublish(payload);
    },
    close: (message?: any) => {
      const payload = {
        open: false,
        message,
      };
      const decoratedPublish = logAction(publishHandler, payload);
      decoratedPublish(payload);
      // publishHandler({
      //   open: false,
      //   message,
      // });
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
    getValue,
  };
};

export { model };
