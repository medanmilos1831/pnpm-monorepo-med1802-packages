import { useEffect, useState } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import type { createRepository } from "../framework/repository";
import type { IStore, IState, IModel } from "./types";

function createReactAdapter(
  repository: ReturnType<
    typeof createRepository<boolean, IStore<IState>, IModel>
  >
) {
  return {
    useToggle: (params: { id: string; initialState: boolean }) => {
      const [toggle] = useState(() => {
        repository.createModel(params);
        return repository.getModel(params.id)!;
      });
      const value = useSyncExternalStore(toggle.onChangeSync, toggle.getValue);
      useEffect(() => {
        return () => {
          repository.deleteModel(params.id);
        };
      }, [params.id]);
      return [value, toggle.close, toggle.getMessage()] as [
        boolean,
        (message?: any) => void,
        any
      ];
    },
  };
}

export { createReactAdapter };
