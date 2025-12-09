import { framework } from "../framework";

interface IState {
  open: boolean;
  message: any;
}
interface IStore<S extends IState> {
  setState: (callback: (params: S) => S) => void;
  getStateByProp: (prop: keyof S) => () => any;
}

interface IModel {
  open: (message?: any) => void;
  close: (message?: any) => void;
}

const app = framework.createRepository<boolean, IStore<IState>, IModel>({
  log: true,
  middlewares: {
    someMiddleware: ({ resolve, reject }, state) => {
      resolve((value, message) => {
        return value + message;
      });
    },
  },
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

app.createModel({
  id: "test",
  initialState: true,
});
app.getModel("test").open("open message");
app.getModel("test").close("close message");
// app.createModel({
//   id: "test2",
//   initialState: false,
// });
// app.createModel({
//   id: "test3",
//   initialState: true,
// });

const HomePage = () => {
  return <>home</>;
};

export { HomePage };
