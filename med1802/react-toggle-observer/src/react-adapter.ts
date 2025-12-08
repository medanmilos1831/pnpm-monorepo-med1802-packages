import { useEffect, useState } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import type { IStore, IToggleModel, toggleConfigType } from "./types";
import type { middlewareParamsType } from "./infrastructure/middleware/types";

function createReactAdapter<S extends IToggleModel>(store: IStore<S>) {
  return {
    useToggle: (params: toggleConfigType) => {
      const [toggle] = useState(() => {
        store.createModel(params);
        return store.getModel(params.id)!;
      });
      const value = useSyncExternalStore(toggle.onChangeSync, toggle.getValue);
      useEffect(() => {
        return () => {
          store.deleteModel(params.id);
        };
      }, [params.id]);
      return [value, toggle.close, toggle.getMessage()] as [
        boolean,
        (message?: any) => void,
        any
      ];
    },

    useMiddleware: ({
      toggleId,
      use,
      value,
    }: {
      toggleId: string;
    } & middlewareParamsType) => {
      const model = store.getModel(toggleId);
      useEffect(() => {
        if (!model.middleware) {
          return;
        }
        const unsubscribe = model.middleware({ use, value });
        return () => {
          if (!model.middleware) {
            return;
          }
          unsubscribe();
        };
      });
    },
  };
}

export { createReactAdapter };
