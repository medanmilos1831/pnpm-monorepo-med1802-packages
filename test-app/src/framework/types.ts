export type StoreModel<M = any> = {
  model: M;
};

export type storeType<I, S> = (params: { id: string; initialState: I }) => S;
