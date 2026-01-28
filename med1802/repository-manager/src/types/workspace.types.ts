import type { IRepositoryConfig } from "./repository.types";

export interface IWorkspaceConfig<D = any> {
  id: string;
  logging?: boolean;
  dependencies: D;
  onSetup(obj: {
    useRepository<R>(repository: IRepositoryConfig<D, R>): void
  }): void;
}
