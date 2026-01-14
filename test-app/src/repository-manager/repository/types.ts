import type { useScope } from "../infrastructure/scope";

export type repositoryType<I = any, R = any> = (obj: {
  instance: {
    infrastructure: I;
  };
}) => R;

export interface IRepositoryPlugin<I = any, R = any> {
  id: string;
  install: repositoryType<I, R>;
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
