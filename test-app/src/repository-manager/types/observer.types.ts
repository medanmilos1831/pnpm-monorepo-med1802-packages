export type ISignalPayload<P = any> = {
  type: string;
  repositoryId: string;
  message?: P;
};

export type ISignalSubscribePayload<P = any> = {
  type: string;
  source: string;
  message: P;
};

export type ISignalBroadcaster = {
  signal<P = any>(payload: ISignalPayload<P>): void;
  subscribe<P = any>(
    callback: (payload: ISignalSubscribePayload<P>) => void
  ): (() => void);
};
