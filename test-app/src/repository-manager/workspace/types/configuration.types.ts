import type { IObserver } from "./observer.types";
import type { Middleware } from "../../core";

export interface IRepositoryPlugin<D = any, R = any> {
  id: string;
  install(obj: { instance: { dependencies: D; observer: IObserver } }): R;
  onConnect?: () => void;
  onDisconnect?: () => void;
  middlewares?: Middleware[];
}

export interface IConfiguration<D = any> {
  id: string;
  logging?: boolean;
  dependencies: D;
  plugins: () => IRepositoryPlugin<D, any>[];
}
