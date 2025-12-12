import { useState } from "react";
import { core } from "../repository-core";
import type { IContext, ICreateToggle, IState } from "./types";
import { useSelector } from "./useSelector";

const toggleRepository = ({ log = false }: { log?: boolean }) => {
  const repo = core.createRepository<IState, IContext>({
    log,
    createState(initialState) {
      return initialState;
    },
    createContext(store) {
      return {
        open: (message?: any) => {
          store.setState((prev: any) => {
            return {
              ...prev,
              open: true,
              message,
            };
          });
        },
        close: (message?: any) => {
          store.setState((prev: any) => {
            return {
              ...prev,
              open: false,
              message,
            };
          });
        },
        // store,
      };
    },
  });
  const reactAdapter = {
    useToggle: (params: ICreateToggle) => {
      const [toggle] = useState(() => {
        repo.createContext(params);
        return repo.getContext(params.id);
      });
      if (!toggle) {
        throw new Error(`Toggle ${params.id} not found`);
      }
      console.log("GET TOGGLE CONTEXT", toggle);
      return {
        open: toggle.open,
        close: toggle.close,
      };
    },
    useToggleSelector: ({
      id,
      selector,
    }: {
      id: string;
      selector: (state: any) => any;
    }) => {
      const [model] = useState(() => {
        return repo.getContext(id);
      });
      if (!model) {
        throw new Error(`Toggle ${id} not found`);
      }
      return useSelector(model, selector);
    },
  };
  return {
    useToggle: reactAdapter.useToggle,
    useToggleSelector: reactAdapter.useToggleSelector,
    createToggle: repo.createContext,
    deleteToggle: repo.deleteModel,
    getToggle: repo.getContext,
  };
};

export { toggleRepository };
