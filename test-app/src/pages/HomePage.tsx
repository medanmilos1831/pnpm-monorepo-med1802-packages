import { framework } from "../framework";

interface IState {
  open: boolean;
  message: any;
}
interface IStore<S extends IState> {
  setState: () => void;
  getStateByProp: (prop: keyof S) => () => any;
}

const app = framework.createRepository<boolean, IStore<IState>>({
  log: true,
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
  model(params: any) {
    console.log("model", params);
    return {};
  },
});

app.createModel({
  id: "test",
  initialState: true,
});
app.createModel({
  id: "test2",
  initialState: false,
});
app.createModel({
  id: "test3",
  initialState: true,
});

const HomePage = () => {
  return <>home</>;
};

export { HomePage };
