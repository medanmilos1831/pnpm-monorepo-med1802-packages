import { createModelContext } from "./context";
import {
  EventName,
  type IEvent,
  type storeConfig,
  type toggleConfigType,
} from "../types";
import { createInfrastructure } from "./createInfrastructure";

const model = (params: toggleConfigType, config: storeConfig) => {
  const context = createModelContext(createInfrastructure(config, params.id));
  const { getMessage, middleware, getValue, subscribe, publishHandler } =
    context;
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
    getValue,
  };
};

export { model };
