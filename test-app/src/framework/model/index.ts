import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import type {
  middlewareParamsType,
  middlewareStoreConfigType,
} from "./middleware/types";
import { createMiddlewareContext } from "./middleware/middlewareContext";
import type { storeType } from "../types";
import { createModelLogger } from "../../toggle/infrastructure/logger/modellogger";
function createModel<I = any, S = any>({
  modelId,
  initialState,
  store,
  middlewares,
  log,
}: {
  modelId: string;
  initialState: I;
  store: storeType<I, S>;
  middlewares: middlewareStoreConfigType<S>;
  log: boolean;
}) {
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  console.log("middlewares", middlewares);
  return {
    publish: messageBroker.publish,
    subscribe: messageBroker.subscribe,
    logger: createModelLogger(log, modelId),
    store: store({
      id: modelId,
      initialState,
    }),
    middleware:
      (eventName: string) =>
      ({ use, value }: middlewareParamsType) => {
        const unsubscribe = messageBroker.interceptor({
          eventName,
          onPublish: (event) => {
            const result = createMiddlewareContext(
              value,
              event.payload
            )(middlewares[use]);
            if (result.status === true) {
              return {
                eventName,
                payload: result.payload,
              };
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
