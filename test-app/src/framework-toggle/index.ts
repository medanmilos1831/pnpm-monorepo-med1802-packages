import { useEffect, useState } from "react";
import { framework } from "../framework";
import { createReactAdapter } from "./react-adapter";
import type { IStore, IState, IModel } from "./types";
import { useSyncExternalStore } from "use-sync-external-store/shim";

const toggleRepository = ({
  log = false,
  middlewares,
}: {
  log?: boolean;
  middlewares: any;
}) => {
  const repo = framework.createRepository<boolean, IStore<IState>, IModel>({
    log,
    middlewares,
    // middlewares: {
    //   someMiddleware: ({ resolve, reject }, state) => {
    //     resolve((value, message) => {
    //       return value + message;
    //     });
    //   },
    // },
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
          eventName: "onChange",
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
        onChangeSync: (callback: () => void) => {
          return context.subscribe({
            eventName: "onChange",
            callback,
          });
        },
        onChange: (callback: (event: any) => void) => {
          return context.subscribe({
            eventName: "onChange",
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
