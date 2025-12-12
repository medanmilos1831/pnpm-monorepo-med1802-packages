import { useState } from "react";
import { core } from "../repository-core";
import { useRepositorySelector } from "../respository-react";
const toggleRepository = core.createRepository<number>({
  log: false,
  createState(initialState) {
    return initialState;
  },
  // model(context) {
  //   return {
  //     increment: () => {
  //       context.setState((prev) => prev + 1);
  //     },
  //     getStore: () => {
  //       return context;
  //     },
  //   };
  // },
});
const useSelector = ({
  id,
  selector,
}: {
  id: string;
  selector: (state: any) => any;
}) => {
  const [model] = useState(() => {
    return toggleRepository.getModel(id);
  });
  if (!model) {
    throw new Error(`Model ${id} not found`);
  }
  return useRepositorySelector(model, (state) => selector(state));
};

const api = {
  createModel: ({ id, initialState }: { id: string; initialState: any }) => {
    toggleRepository.createModel({ id, initialState });
  },
  increment: () => {
    toggleRepository.getModel("counter").setState((prev) => prev + 1);
  },
  useSelector: ({
    id,
    selector,
  }: {
    id: string;
    selector: (state: any) => any;
  }) => {
    return useSelector({ id, selector });
  },
};

const HomePage = () => {
  api.createModel({ id: "counter", initialState: 0 });
  const e = api.useSelector({ id: "counter", selector: (state) => state });
  console.log(e);
  return (
    <>
      <button onClick={() => api.increment()}>Increment</button>
      <p>Counter: {e}</p>
    </>
  );
};

export { HomePage };
