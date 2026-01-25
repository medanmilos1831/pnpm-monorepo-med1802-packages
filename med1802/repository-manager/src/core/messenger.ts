import type { scopedObserverType } from "../infrastructure";
import type { IMessenger, IRepositoryConfig } from "../types";

function createMessenger (config: {
    observer: scopedObserverType;
    subscriptions: (() => void)[];
    repositoryConfig: IRepositoryConfig;
}): IMessenger {
    const { observer, subscriptions, repositoryConfig } = config;
    return {
      dispatch({ repositoryId, type, message }){
        if (repositoryId === repositoryConfig.id) {
          console.warn("WARNING: DISPATCHING TO SELF");
          return;
        }
        observer.dispatch({
          scope: repositoryId,
          eventName: "dispatch",
          payload: {
            type,
            message,
            source: repositoryConfig.id,
          },
        });
      },
      subscribe(handler) {
        if (subscriptions.length > 0) {
          console.warn("WARNING: SUBSCRIBED ALREADY");
          return;
        }
        const unsubscribe = observer.subscribe({
          scope: repositoryConfig.id,
          eventName: "dispatch",
          callback({ payload }) {
            const { type, message, source } = payload;
            handler({
              type,
              message: message ?? undefined,
              source,
            });
          },
        });
        subscriptions.push(unsubscribe);
      },
    };
  }

export { createMessenger };