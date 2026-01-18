export interface IBroker {
  publish: (params: { topic: string; payload?: any; source?: string }) => void;
  consumer: any;
}
export type repositoryType<I = any, R = any> = (obj: {
  instance: {
    infrastructure: I;
    broker: IBroker;
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
