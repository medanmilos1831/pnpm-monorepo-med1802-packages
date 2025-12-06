import type { createMessageBroker } from "@med1802/scoped-observer-message-broker";

import { createMiddlewareContext } from "./middlewareContext";
import type { middlewareParamsType, middlewareStoreConfigType } from "./types";
import type { createMessageContainer } from "../messageContainer";
import { EventName } from "../../types";

const createMiddleware = (
  middlewares: middlewareStoreConfigType,
  messageBroker: ReturnType<typeof createMessageBroker>
  // messageContainer: ReturnType<typeof createMessageContainer>
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
          messageBroker.publish({
            eventName: EventName.ON_SET_MESSAGE,
            payload: result.payload.message,
          });
          // messageContainer.setMessage(result.payload.message);
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
