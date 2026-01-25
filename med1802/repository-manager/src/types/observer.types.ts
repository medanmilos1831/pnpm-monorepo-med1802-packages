export type IMessengerDispatch<P = any> = {
  type: string;
  repositoryId: string;
  message?: P;
};

export type IMessengerSubscribePayload<P = any> = {
  type: string;
  source: string;
  message: P;
};

export type IMessenger = {
  dispatch<P = any>(payload: IMessengerDispatch<P>): void;
  subscribe<P = any>(
    callback: (payload: IMessengerSubscribePayload<P>) => void
  ): void;
};
