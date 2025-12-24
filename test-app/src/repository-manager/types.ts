type RepositoryType<D = any, R = any> = (dependencies: D) => R;
export interface IManagerConfig<D = any, R = any> {
  id: string;
  dependencies: D;
  repositories: Record<string, RepositoryType<D, R>>;
  logging?: boolean;
}

export interface IContainerInstance<R = any> {
  queryRepository(id: string): {
    repository: R;
    disconnect: () => void;
  };
}
export interface IRepositoryInstance<R = any> {
  connect(): R;
  disconnect(): void;
  getReference(): R;
  getConnections(): number;
}
