import type { createMessageBroker } from "@med1802/scoped-observer-message-broker";

import { createMiddlewareContext } from "./middlewareContext";
import type { middlewareParamsType, middlewareStoreConfigType } from "./types";

import { EventName } from "../../types";
import type { createModelStore } from "../modelStore";

const createMiddleware = (
  middlewares: middlewareStoreConfigType,
  messageBroker: ReturnType<typeof createMessageBroker>,
  modelState: ReturnType<typeof createModelStore>
) => {
  return ({ use, value }: middlewareParamsType) => {
    const unsubscribe = messageBroker.interceptor({
      eventName: EventName.ON_CHANGE,
      onPublish: (event) => {
        const result = createMiddlewareContext(
          event.payload,
          value
        )(middlewares[use]);
        if (typeof result === "object") {
          modelState.setState((state) => ({
            ...state,
            message: result.payload.message,
          }));
        }
        if (result.status === false) {
          return false;
        }
        return {
          eventName: EventName.ON_CHANGE,
          payload: result.payload,
        };
      },
    });
    return () => {
      unsubscribe();
    };
  };
};

export { createMiddleware };
