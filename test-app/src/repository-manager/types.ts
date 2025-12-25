export interface IConfiguration {
  id: string;
  logging?: boolean;
}

export interface IContainerInstance<I = any, R = any> {
  defineRepository(
    id: string,
    repositoryDefinition: (infrastructure: I) => void
  ): void;
  queryRepository(id: string): {
    repository: ReturnType<IRepositoryInstance<R>["getReference"]>;
    disconnect(): void;
  };
}

export interface IRepositoryInstance<R = any> {
  connect(): void;
  disconnect(): void;
  getReference(): R;
  getConnections(): number;
}
