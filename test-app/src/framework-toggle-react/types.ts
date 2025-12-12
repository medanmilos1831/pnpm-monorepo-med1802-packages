interface IState {
  open: boolean;
  message: any;
}

interface IModel {
  open: (message?: any) => void;
  close: (message?: any) => void;
  store: any;
}
interface ICreateToggle {
  id: string;
  initialState: IState;
}
export type { IModel, IState, ICreateToggle };
