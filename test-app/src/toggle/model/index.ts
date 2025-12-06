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
    getMessage,
    middleware,
    getInitialState,
    setInitialState,
    publish,
    subscribe,
  } = context;
  function publishHandler(payload: { open: boolean; message?: any }) {
    const { open, message } = payload;
    publish({
      eventName: EventName.ON_SET_MESSAGE,
      payload,
    });
    setInitialState(open);
    publish({
      eventName: EventName.ON_CHANGE,
      payload,
    });
    if (config.log) {
      publish({
        eventName: EventName.ON_LOG_ACTION,
        payload,
      });
    }
    return {
      eventName: EventName.ON_CHANGE,
      payload,
    };
  }
  return {
    open: (message?: any) => {
      publishHandler({
        open: true,
        message,
      });
    },
    close: (message?: any) => {
      publishHandler({
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
