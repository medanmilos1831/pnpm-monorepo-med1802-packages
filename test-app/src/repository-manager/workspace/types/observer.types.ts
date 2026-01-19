export type IObserverDispatch<P = any> = {
  type: string;
  repositoryId: string;
  message?: P;
};

export type IObserverSubscribePayload<P = any> = {
  type: string;
  source: string;
  message: P;
};

export type IObserver = {
  dispatch<P = any>(payload: IObserverDispatch<P>): void;
  subscribe<P = any>(
    callback: (payload: IObserverSubscribePayload<P>) => void
  ): void;
};
