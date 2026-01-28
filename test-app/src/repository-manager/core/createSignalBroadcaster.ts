import type { scopedObserverType } from "../infrastructure";
import type { ISignalBroadcaster, IRepositoryConfig } from "../types";

function createSignalBroadcaster (config: {
    observer: scopedObserverType;
    repositoryConfig: IRepositoryConfig;
}): ISignalBroadcaster {
    const { observer, repositoryConfig } = config;
    return {
      signal({ repositoryId, type, message }){
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
        return unsubscribe;
      },
    };
  }

export { createSignalBroadcaster };