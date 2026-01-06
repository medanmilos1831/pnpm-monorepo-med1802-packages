export type repositoryType<I = any, R = any> = (
  infrastructure: I,
  ctx: any
) => R;

export interface IConfiguration {
  id: string;
  logging?: boolean;
}

export interface IWorkspace<I = any, R = any> {
  defineRepository(repositoryPlugin: IRepositoryPlugin<I, R>): void;
  queryRepository<I = any, R = any>(
    id: string
  ): {
    repository: ReturnType<repositoryType<I, R>>;
    disconnect(): void;
  };
  createContext: IContext;
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

export interface IRepositoryPlugin<I = any, R = any> {
  id: string;
  install: repositoryType<I, R>;
  middlewares?: Middleware[];
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface IContextConfig<V = any> {
  id: string;
  value?: V;
}

export interface IContextProviderOptions<V = any> {
  value?: V;
  children: () => void;
}

export interface IContext {
  createContext<V = any>(
    config: IContextConfig<V>
  ): {
    provider(options: IContextProviderOptions<V>): void;
  };
}
