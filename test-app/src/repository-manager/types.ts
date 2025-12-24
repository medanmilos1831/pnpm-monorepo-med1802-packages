export interface IConfiguration {
  logging?: boolean;
}

export interface IRepositoryInstance {
  connect(): void;
  disconnect(): void;
  getReference(): unknown;
  getConnections(): number;
}
