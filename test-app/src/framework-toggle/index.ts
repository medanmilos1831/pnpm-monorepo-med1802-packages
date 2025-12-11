import { useEffect, useState } from "react";
import { framework } from "../framework";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import type { IInitialState, IState, IModel } from "./types";

const toggleRepository = ({ log = false }: { log?: boolean }) => {
  const repo = framework.createRepository<IInitialState, IState, IModel>({
    log,
    createState(initialState) {
      return {
        message: undefined,
        ...initialState,
      };
    },
    model(context) {
      return {
        open: (message?: any) => {
          context.setState((prev) => {
            return {
              ...prev,
              open: true,
              message,
            };
          });
        },
        close: (message?: any) => {
          context.setState((prev) => {
            return {
              ...prev,
              open: false,
              message,
            };
          });
        },
        onChangeSync: (notify: () => void) => {
          return context.subscribe(() => {
            notify();
          });
        },
        onChange: (callback: (event: any) => void) => {
          return context.subscribe((state) => {
            callback(state);
          });
        },
        getMessage: context.getStateByProp("message"),
        getValue: context.getStateByProp("open"),
      };
    },
  });
  const reactAdapter = {
    useToggle: (params: {
      id: string;
      initialState: { open: boolean; message?: any };
    }) => {
      const [toggle] = useState(() => {
        repo.createModel(params);
        return repo.getModel(params.id)!;
      });
      const value = useSyncExternalStore(toggle.onChangeSync, toggle.getValue);
      useEffect(() => {
        return () => {
          repo.deleteModel(params.id);
        };
      }, [params.id]);
      return [value, toggle.close, toggle.getMessage()] as [
        boolean,
        (message?: any) => void,
        any
      ];
    },
  };
  return {
    useToggle: reactAdapter.useToggle,
    createToggle: repo.createModel,
    deleteToggle: repo.deleteModel,
    getToggle: repo.getModel,
  };
};

export { toggleRepository };
