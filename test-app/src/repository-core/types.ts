export type StoreModel<C = any> = {
  context: C;
};

export type storeType<I, S> = (params: { id: string; initialState: I }) => S;

export enum StoreEventType {
  SET_STATE = "setState",
}
