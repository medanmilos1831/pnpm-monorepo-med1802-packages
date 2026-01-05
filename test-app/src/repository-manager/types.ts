export type repositoryType<I = any, R = any> = (infrastructure: I) => R;

export interface IConfiguration {
  id: string;
  logging?: boolean;
}

export interface IWorkspace<I = any, R = any> {
  defineRepository(repositoryPlugin: IRepositoryPlugin<I, R>): void;
  queryRepository(id: string): {
    repository: ReturnType<repositoryType<I, R>>;
    disconnect(): void;
  };
}

export interface IRepositoryInstance<R = any> {
  connect(): void;
  disconnect(): void;
  repository: ReturnType<repositoryType<any, R>> | undefined;
  connections: number;
}

export interface ILifeCycle {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export type Middleware = (
  method: string,
  args: any[],
  next: (...nextArgs: any[]) => any
) => any;

export interface IRepositoryConfig {
  lifecycle?: ILifeCycle;
  middlewares?: Middleware[];
}

export interface IRepositoryPlugin<I = any, R = any> {
  id: string;
  install: repositoryType<I, R>;
  middlewares?: Middleware[];
  onConnect?: () => void;
  onDisconnect?: () => void;
}
