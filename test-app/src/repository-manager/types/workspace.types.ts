import type { IRepositoryConfig } from "./repository.types";

export interface IWorkspaceConfig<D = any> {
  id: string;
  logging?: boolean;
  dependencies: D;
}
