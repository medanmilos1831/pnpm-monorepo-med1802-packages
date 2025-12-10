import { useEffect, useState } from "react";
import { framework } from "../framework";
import {
  type IStore,
  type IState,
  type IModel,
  ToggleEventName,
} from "./types";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import type { middlewareParamsType } from "../framework/model/middleware/types";

const toggleRepository = ({
  log = false,
  middlewares,
}: {
  log?: boolean;
  middlewares?: any;
}) => {
  const repo = framework.createRepository<boolean, IStore<IState>, IModel>({
    log,
    middlewares,
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
            callback: ({ payload }: any) => {
              context.store.setState((state) => {
                const { open, ...rest } = payload;
                return {
                  ...state,
                  open,
                  message: rest,
                };
              });
              notify();
            },
          });
        },
        onChange: (callback: (event: any) => void) => {
          return context.subscribe({
            eventName: ToggleEventName.ON_CHANGE,
            callback,
          });
        },
        middleware: context.middleware,
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
    useMiddleware: ({
      toggleId,
      use,
      value,
    }: {
      toggleId: string;
    } & middlewareParamsType) => {
      const model = repo.getModel(toggleId);
      console.log("model", model.middleware);
      useEffect(() => {
        if (!model.middleware) {
          return;
        }
        const middleware = model.middleware(ToggleEventName.ON_CHANGE);
        const unsubscribe = middleware({ use, value });
        return () => {
          if (!model.middleware) {
            return;
          }
          unsubscribe();
        };
      });
    },
  };
  return {
    useToggle: reactAdapter.useToggle,
    useMiddleware: reactAdapter.useMiddleware,
    createToggle: repo.createModel,
    deleteToggle: repo.deleteModel,
    getToggle: repo.getModel,
  };
};

export { toggleRepository };

// const reactAdapter = {
//   useToggle: (params: { id: string; initialState: boolean }) => {
//     const [toggle] = useState(() => {
//       toggleRepository.createModel(params);
//       return toggleRepository.getModel(params.id)!;
//     });
//     const value = useSyncExternalStore(toggle.onChangeSync, toggle.getValue);
//     useEffect(() => {
//       return () => {
//         toggleRepository.deleteModel(params.id);
//       };
//     }, [params.id]);
//     return [value, toggle.close, toggle.getMessage()] as [
//       boolean,
//       (message?: any) => void,
//       any
//     ];
//   },
// };

// const toggle = {
//   useToggle: reactAdapter.useToggle,
//   createToggle: toggleRepository.createModel,
//   deleteToggle: toggleRepository.deleteModel,
//   getToggle: toggleRepository.getModel,
// };

// export { toggle };
