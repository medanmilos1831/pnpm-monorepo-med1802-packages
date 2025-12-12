import { useState } from "react";
import { core } from "@med1802/repository-engine";
import type { ICreateToggle, IModel, IState } from "./types";
import { useSelector } from "./useSelector";

const toggleRepository = ({ log = false }: { log?: boolean }) => {
  const repo = core.createRepository<IState>({
    log,
    createState(initialState) {
      return initialState;
    },
  });
  console.log(repo);
  // const reactAdapter = {
  //   useToggle: (params: ICreateToggle) => {
  //     const [toggle] = useState(() => {
  //       repo.createModel(params);
  //       return repo.getModel(params.id);
  //     });
  //     if (!toggle) {
  //       throw new Error(`Toggle ${params.id} not found`);
  //     }
  //     return {
  //       open: toggle.open,
  //       close: toggle.close,
  //     };
  //   },
  //   useToggleSelector: ({
  //     id,
  //     selector,
  //   }: {
  //     id: string;
  //     selector: (state: any) => any;
  //   }) => {
  //     const [model] = useState(() => {
  //       return repo.getModel(id);
  //     });
  //     if (!model) {
  //       throw new Error(`Toggle ${id} not found`);
  //     }
  //     return useSelector(model.store, selector);
  //   },
  // };

  return {
    // useToggle: reactAdapter.useToggle,
    // useToggleSelector: reactAdapter.useToggleSelector,
    createToggle: repo.createModel,
    deleteToggle: repo.deleteModel,
    getToggle: repo.getModel,
  };
};

export { toggleRepository };
