import type { IMessenger } from "./observer.types";

export interface IRepositoryConfig<D = any, R = any> {
  id: string;
  install: repositoryType<D, R>;
  middlewares?: Middleware[];
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export type repositoryType<D = any, R = any> = (obj: {
  instance: {
    dependencies: D;
    messenger: IMessenger;
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
