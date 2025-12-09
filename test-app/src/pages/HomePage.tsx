import { framework } from "../framework";

interface IState {
  open: boolean;
  message: any;
}
interface IStore<S extends IState> {
  // state: S;
  setState: () => void;
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
      setState() {
        console.log("setState");
      },
      getStateByProp(prop: keyof typeof state) {
        return () => {};
      },
    };
  },
  model(context) {
    return {
      open: (message?: any) => {
        console.log("open", message);
        // publishHandler({
        //   open: true,
        //   message,
        // });
      },
      close: (message?: any) => {
        console.log("close", message);
        // publishHandler({
        //   open: false,
        //   message,
        // });
      },
    };
  },
});

app.createModel({
  id: "test",
  initialState: true,
});
app.getModel("test").open();
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
