import type { StoreModel } from "./types";

function createRepository<I, S>({
  log,
  model,
  store,
}: {
  log: boolean;
  model: (params: any) => any;
  store: (params: { id: string; initialState: I }) => S;
}) {
  const repository = new Map<string, StoreModel>();

  return {
    createModel(params: { id: string; initialState: I }) {
      const storeModel = store(params);
      if (repository.has(params.id)) return;
      // repository.set(params.id, {
      //   model: model(params),
      // });
      // console.log("repository", repository);
    },
    // getModel: (id: string) => {
    //   if (!repository.has(id)) {
    //     throw new Error(`Toggle ${id} not found`);
    //   }
    //   const model = repository.get(id)!.model;
    //   return model;
    // },
    // hasModel: (id: string) => {
    //   return repository.has(id);
    // },
    // deleteModel: (id: string) => {
    //   repository.delete(id);
    // },
  };
}

export { createRepository };
