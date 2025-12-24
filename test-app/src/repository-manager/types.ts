export type RepositoryType<D = any, R = any> = (dependencies: D) => R;
export interface IManagerConfig<D = any, R = any> {
  id: string;
  dependencies: D;
  repositories: R;
  logging?: boolean;
}

export interface IContainerInstance<K> {
  queryRepository<R = any>(
    id: keyof K
  ): {
    repository: ReturnType<RepositoryType<any, R>>;
    disconnect: () => void;
  };
}
export interface IRepositoryInstance<R = any> {
  connect(): R;
  disconnect(): void;
  getReference(): R;
  getConnections(): number;
}
