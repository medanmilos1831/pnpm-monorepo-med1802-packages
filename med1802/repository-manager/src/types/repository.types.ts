import type { IObserver } from "./observer.types";

export interface IPlugin<D = any, R = any> {
  id: string;
  install: pluginType<D, R>;
  middlewares?: Middleware[];
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export type pluginType<D = any, R = any> = (obj: {
  instance: {
    dependencies: D;
    observer: IObserver;
  };
}) => R;

export interface IRepository<R = any> {
  connect(): void;
  disconnect(): void;
  repository: ReturnType<pluginType<any, R>> | undefined;
  connections: number;
}

export type Middleware = (
  method: string,
  args: any[],
  next: (...nextArgs: any[]) => any
) => any;
