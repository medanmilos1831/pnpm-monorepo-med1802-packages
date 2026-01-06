export interface IContextConfig<V = any> {
  id: string;
  value?: V;
}

export interface IContextProviderOptions<V = any> {
  value?: V;
  children: () => void;
}

export interface IContext {
  createContext<V = any>(
    config: IContextConfig<V>
  ): {
    provider(options: IContextProviderOptions<V>): void;
  };
}
