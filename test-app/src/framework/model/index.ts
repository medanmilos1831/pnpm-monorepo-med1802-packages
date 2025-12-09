import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import type {
  middlewareParamsType,
  middlewareStoreConfigType,
} from "./middleware/types";
import { createMiddlewareContext } from "./middleware/middlewareContext";
function createModel<S = any>({
  modelId,
  store,
  middlewares,
  log,
}: {
  modelId: string;
  store: S;
  middlewares: middlewareStoreConfigType;
  log: boolean;
}) {
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  return {
    publish: messageBroker.publish,
    subscribe: messageBroker.subscribe,
    middleware:
      (eventName: string, middlewares: middlewareStoreConfigType) =>
      ({ use, value }: middlewareParamsType) => {
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
      },
  };
}

export { createModel };
