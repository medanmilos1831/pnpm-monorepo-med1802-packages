import type { ISignalPayload, ISignalSubscribePayload } from "./observer.types";

export interface IRepositoryConfig<D = any, R = any> {
  id: string;
  install: repositoryType<D, R>;
  middlewares?: Middleware[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSignal?: (event: ISignalSubscribePayload, repo: R ) => void;
}

export type repositoryType<D = any, R = any> = (obj: {
  instance: {
    dependencies: D;
    signal<S = any>(payload: ISignalPayload<S>): void;
  };
}) => R;

export interface IRepositoryInstance<R = any> {
  connect(): void;
  disconnect(): void;
  repository: ReturnType<repositoryType<any, R>> | undefined;
  connections: number;
}

export type Middleware = (
  method: string,
  args: any[],
  next: (...nextArgs: any[]) => any
) => any;
