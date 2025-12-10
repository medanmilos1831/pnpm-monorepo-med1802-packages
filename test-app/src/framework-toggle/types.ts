interface IState {
  open: boolean;
  message: any;
}
interface IStore<S extends IState> {
  setState: (callback: (params: S) => S) => void;
  getStateByProp: (prop: keyof S) => () => any;
}

interface IModel {
  open: (message?: any) => void;
  close: (message?: any) => void;
  onChangeSync: (callback: () => void) => () => void;
  onChange: (callback: (event: any) => void) => () => void;
  getMessage: () => any;
  getValue: () => boolean;
}

export enum ToggleEventName {
  ON_CHANGE = "onChange",
}
export type { IState, IStore, IModel };
