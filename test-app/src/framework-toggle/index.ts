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
    commands(setState) {
      return {
        open: (message?: any) => {
          setState((prev) => {
            return {
              ...prev,
              open: true,
              message,
            };
          });
        },
        close: (message?: any) => {
          setState((prev) => {
            return {
              ...prev,
              open: false,
              message,
            };
          });
        },
      };
    },
  });
  const reactAdapter = {
    useToggle: (params: ICreateToggle) => {
      const [toggle] = useState(() => {
        repo.create(params);
        return repo.get(params.id);
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
        return repo.get(id);
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
    createToggle: repo.create,
    deleteToggle: repo.remove,
    getToggle: repo.get,
  };
};

export { toggleRepository };
