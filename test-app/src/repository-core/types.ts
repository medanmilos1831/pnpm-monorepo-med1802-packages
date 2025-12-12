export type StoreModel<M = any> = {
  model: M;
};

export type storeType<I, S> = (params: { id: string; initialState: I }) => S;

export enum StoreEventType {
  SET_STATE = "setState",
}
