import type { IContext } from "./workspace/modules";
import type {
  IRepositoryPlugin,
  repositoryType,
} from "./workspace/modules/repository/types";

export interface IConfiguration {
  id: string;
  logging?: boolean;
}

export interface IWorkspace<I = any, R = any> {
  defineRepository(repositoryPlugin: IRepositoryPlugin<I, R>): void;
  queryRepository<I = any, R = any>(
    id: string
  ): {
    repository: ReturnType<repositoryType<I, R>>;
    disconnect(): void;
  };
  createContext: IContext;
}
