export interface IConfiguration {
  id: string;
  logging?: boolean;
}

export interface IContainerInstance<I> {
  defineRepository(
    id: string,
    repositoryDefinition: (infrastructure: I) => void
  ): void;
  queryRepository<R>(id: string): {
    repository: R;
    disconnect(): void;
  };
}

export interface IRepositoryInstance<R = any> {
  connect(): void;
  disconnect(): void;
  getReference(): R;
  getConnections(): number;
}
