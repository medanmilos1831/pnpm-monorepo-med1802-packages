export type repositoryType<I = any, R = any> = (infrastructure: I) => R;

export interface IConfiguration {
  id: string;
  logging?: boolean;
}

export interface IWorkspace<I = any, R = any> {
  defineRepository(id: string, repository: repositoryType<I, R>): void;
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
