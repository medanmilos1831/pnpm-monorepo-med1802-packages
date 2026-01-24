import type { IPlugin } from "./repository.types";

export interface IWorkspaceConfig<D = any> {
  id: string;
  logging?: boolean;
  dependencies: D;
  plugins: () => IPlugin<D, any>[];
}
