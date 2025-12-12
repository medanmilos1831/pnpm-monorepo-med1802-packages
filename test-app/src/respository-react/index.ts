import { core as repositoryCore } from "@med1802/repository-engine";
import { useRepositorySelector } from "./useRepositorySelector";
import { useState } from "react";

function createRepositoryReactAdapter<S>({
  createState,
}: {
  createState: (initialState: S) => S;
}) {
  const core = repositoryCore.createRepository({
    log: true,
    createState,
  });
  return {
    createModel: core.createModel,
    getModel: core.getModel,
    hasModel: core.hasModel,
    deleteModel: core.deleteModel,
    useRepositorySelector: ({
      id,
      selector,
    }: {
      id: string;
      selector: (state: any) => any;
    }) => {
      const [model] = useState(() => {
        return core.getModel(id);
      });
      if (!model) {
        throw new Error(`Model ${id} not found`);
      }
      return useRepositorySelector(model, selector);
    },
  };
}

export { createRepositoryReactAdapter };
