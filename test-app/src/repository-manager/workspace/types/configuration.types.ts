import type { IObserver } from "./observer.types";
import type { Middleware } from "../../core";

export interface IConfiguration<I = any> {
  id: string;
  logging?: boolean;
  infrastructure: I;
  repositories: () => {
    id: string;
    install(obj: { instance: { infrastructure: I; observer: IObserver } }): any;
    onConnect?: () => void;
    onDisconnect?: () => void;
    middlewares?: Middleware[];
  }[];
}
