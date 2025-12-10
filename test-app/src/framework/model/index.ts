import { createScopedObserver } from "@med1802/scoped-observer";
import { createMessageBroker } from "@med1802/scoped-observer-message-broker";
import type { storeType } from "../types";
import { createModelLogger } from "../../toggle/infrastructure/logger/modellogger";
function createModel<I = any, S = any, MI = any>({
  modelId,
  initialState,
  store,
  middlewares,
  log,
}: {
  modelId: string;
  initialState: I;
  store: storeType<I, S>;
  middlewares?: {
    [key: string]: (params: {
      resolve: (callback: (value: any, payload: any) => MI) => void;
      reject: () => void;
    }) => void;
  };
  log: boolean;
}) {
  const scopedObserver = createScopedObserver();
  const messageBroker = createMessageBroker(scopedObserver);
  return {
    publish: messageBroker.publish,
    subscribe: messageBroker.subscribe,
    logger: createModelLogger(log, modelId),
    store: store({
      id: modelId,
      initialState,
    }),
    middleware: middlewares
      ? (eventName: string) =>
          ({ use, value }: any) => {
            const unsubscribe = messageBroker.interceptor({
              eventName,
              onPublish: (event) => {
                let middlewareContext = {
                  status: true,
                  payload: event.payload,
                };
                // console.log("event", event);
                // console.log("use", use);
                // console.log("value", value);
                const result = middlewares[use]({
                  resolve: (params) => {
                    // console.log("RESOLVE", params);
                    const result = params(value, event.payload);
                    console.log("RESULT", result);
                  },
                  reject: () => {
                    console.log("REJECT");
                  },
                });
                // console.log("result", result);
                // const result = createMiddlewareContext(
                //   value,
                //   event.payload
                // )(middlewares[use]);
                // if (result.status === true) {
                //   return {
                //     eventName,
                //     payload: result.payload,
                //   };
                // }
                // if (result.status === false) {
                //   return false;
                // }
                return {
                  eventName,
                  payload: event.payload,
                };
              },
            });
            return () => {
              unsubscribe();
            };
          }
      : undefined,
  };
}

export { createModel };
