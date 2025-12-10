import type { createModel } from "./model";

export type StoreModel<M = any> = {
  model: M;
};

export type storeType<I, S> = (params: { id: string; initialState: I }) => S;
export type modelType<S> = (context: ReturnType<typeof createModel>) => S;
