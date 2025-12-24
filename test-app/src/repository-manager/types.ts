export interface IConfiguration {
  logging?: boolean;
}

export interface IRepositoryInstance {
  connect(): void;
  disconnect(): void;
  getReference(): unknown;
  getConnections(): number;
}

export interface IContainerConfig<D = any> {
  id: string;
  dependencies: D;
  repositories: Record<string, (dependencies: D) => any>;
  logging?: boolean;
}

export interface IContainerInstance {
  query(id: string): any;
}

export type ManagerType<D> = IContainerConfig<D>[];
