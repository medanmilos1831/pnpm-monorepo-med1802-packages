interface IInitialState {
  open: boolean;
  message?: any;
}

interface IState {
  open: boolean;
  message: any;
}

interface IModel {
  open: (message?: any) => void;
  close: (message?: any) => void;
  onChangeSync: (callback: () => void) => () => void;
  onChange: (callback: (event: any) => void) => () => void;
  getMessage: () => any;
  getValue: () => boolean;
}
export type { IModel, IState, IInitialState };
