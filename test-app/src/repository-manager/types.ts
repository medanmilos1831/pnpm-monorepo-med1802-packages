export type RepositoryType<D = any, R = any> = (dependencies: D) => R;
export interface IManagerConfig<
  D = any,
  R extends Record<string, RepositoryType<D>> = Record<
    string,
    RepositoryType<D>
  >
> {
  id: string;
  dependencies: D;
  repositories: R;
  logging?: boolean;
}
export interface IContainerInstance<D, K> {
  queryRepository<R = any>(
    id: keyof K
  ): {
    repository: ReturnType<RepositoryType<D, R>>;
    disconnect: () => void;
  };
}
export interface IRepositoryInstance<R extends Record<string, any>> {
  connect(): void;
  disconnect(): void;
  getReference(): R;
  getConnections(): number;
}
