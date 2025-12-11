interface IState {
  open: boolean;
  message: any;
}

interface IModel {
  open: (message?: any) => void;
  close: (message?: any) => void;
  onChangeSync: (callback: () => void) => () => void;
  onChange: (callback: (event: any) => void) => () => void;
  getMessage: undefined;
  getValue: undefined;
}

export enum ToggleEventName {
  ON_CHANGE = "onChange",
}
export type { IModel, IState };
