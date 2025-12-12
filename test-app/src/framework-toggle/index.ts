import { useState } from "react";
import { framework } from "../repository-core";
import type { ICreateToggle, IModel, IState } from "./types";
import { useSelector } from "./useSelector";

const toggleRepository = ({ log = false }: { log?: boolean }) => {
  const repo = framework.createRepository<IState, IModel>({
    log,
    createState(initialState) {
      return initialState;
    },
    model(context) {
      return {
        open: (message?: any) => {
          context.setState((prev) => {
            return {
              ...prev,
              open: true,
              message,
            };
          });
        },
        close: (message?: any) => {
          context.setState((prev) => {
            return {
              ...prev,
              open: false,
              message,
            };
          });
        },
        store: context,
      };
    },
  });
  const reactAdapter = {
    useToggle: (params: ICreateToggle) => {
      const [toggle] = useState(() => {
        repo.createModel(params);
        return repo.getModel(params.id);
      });
      if (!toggle) {
        throw new Error(`Toggle ${params.id} not found`);
      }
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
        return repo.getModel(id);
      });
      if (!model) {
        throw new Error(`Toggle ${id} not found`);
      }
      return useSelector(model.store, selector);
    },
  };
  return {
    useToggle: reactAdapter.useToggle,
    useToggleSelector: reactAdapter.useToggleSelector,
    createToggle: repo.createModel,
    deleteToggle: repo.deleteModel,
    getToggle: repo.getModel,
  };
};

export { toggleRepository };
