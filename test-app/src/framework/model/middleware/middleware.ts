import type { createMessageBroker } from "@med1802/scoped-observer-message-broker";

import { createMiddlewareContext } from "./middlewareContext";
import type { middlewareParamsType, middlewareStoreConfigType } from "./types";

const createMiddleware = (
  eventName: string,
  middlewares: middlewareStoreConfigType,
  messageBroker: ReturnType<typeof createMessageBroker>
) => {
  return ({ use, value }: middlewareParamsType) => {
    const unsubscribe = messageBroker.interceptor({
      eventName,
      onPublish: (event) => {
        const result = createMiddlewareContext(
          event.payload,
          value
        )(middlewares[use]);
        if (typeof result === "object") {
          // modelState.setState((state) => ({
          //   ...state,
          //   message: result.payload.message,
          // }));
        }
        if (result.status === false) {
          return false;
        }
        return {
          eventName,
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
