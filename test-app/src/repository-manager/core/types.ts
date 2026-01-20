import type { IObserver } from "../workspace";

export type repositoryType<D = any, R = any> = (obj: {
  instance: {
    dependencies: D;
    observer: IObserver;
  };
}) => R;

export interface IRepositoryPlugin<D = any, R = any> {
  id: string;
  install: repositoryType<D, R>;
  middlewares?: Middleware[];
  onConnect?: () => void;
  onDisconnect?: () => void;
}

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
