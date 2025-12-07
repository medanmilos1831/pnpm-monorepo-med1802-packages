import type { middlewareStoreConfigType } from "./infrastructure/middleware/types";

export enum EventName {
  ON_CHANGE = "onChange",
}
export type onChangePayload = { open: boolean; message?: any };
export interface IEvent<P = any> {
  scope?: string;
  eventName: string;
  payload: P;
}

export type toggleConfigType = {
  id: string;
  initialState: boolean;
};

export interface IToggleModel {
  open: (message?: any) => void;
  close: (message?: any) => void;
  middleware:
    | (({ use, value }: { use: string; value: any }) => () => void)
    | undefined;
  onChangeSync: (notify: () => void) => () => void;
  onChange: (callback: (payload: IEvent) => void) => () => void;
  getMessage: () => any;
  getValue: () => boolean;
}

export type storeConfig = {
  log: boolean;
  middlewares?: middlewareStoreConfigType;
};

export type StoreModel<T> = {
  model: T;
};
export type StoreType<T> = Map<string, StoreModel<T>>;
export interface IStore<T> {
  createModel: (params: toggleConfigType) => void;
  getModel: (id: string) => T;
  hasModel: (id: string) => boolean;
  deleteModel: (id: string) => void;
}
