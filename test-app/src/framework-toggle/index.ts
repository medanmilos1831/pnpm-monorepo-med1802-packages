import { useEffect, useState } from "react";
import { framework } from "../framework";
import {
  type IStore,
  type IState,
  type IModel,
  ToggleEventName,
} from "./types";
import { useSyncExternalStore } from "use-sync-external-store/shim";

const toggleRepository = ({ log = false }: { log?: boolean }) => {
  const repo = framework.createRepository<boolean, IStore<IState>, IModel>({
    log,
    store({ id, initialState }: { id: string; initialState: boolean }) {
      let state = {
        open: initialState,
        message: undefined,
      };
      return {
        setState(callback: (params: typeof state) => typeof state) {
          state = callback(state);
        },
        getStateByProp(prop: keyof typeof state) {
          return () => state[prop];
        },
      };
    },
    model(context) {
      function publishHandler(payload: any) {
        context.store.setState((state) => ({
          ...state,
          ...payload,
        }));
        const decoratedPublish = context.logger.logAction(
          context.publish,
          payload
        );
        decoratedPublish({
          eventName: ToggleEventName.ON_CHANGE,
          payload,
        });
      }
      const getMessage = context.store.getStateByProp("message");
      const getValue = context.store.getStateByProp("open");
      return {
        open: (message?: any) => {
          publishHandler({
            open: true,
            message,
          });
        },
        close: (message?: any) => {
          publishHandler({
            open: false,
            message,
          });
        },
        onChangeSync: (notify: () => void) => {
          return context.subscribe({
            eventName: ToggleEventName.ON_CHANGE,
            callback: notify,
          });
        },
        onChange: (callback: (event: any) => void) => {
          return context.subscribe({
            eventName: ToggleEventName.ON_CHANGE,
            callback,
          });
        },
        getMessage,
        getValue,
      };
    },
  });
  const reactAdapter = {
    useToggle: (params: { id: string; initialState: boolean }) => {
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
