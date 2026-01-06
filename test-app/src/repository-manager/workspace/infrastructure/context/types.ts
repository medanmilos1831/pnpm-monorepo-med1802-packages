export interface IContextConfig<V = any> {
  id: string;
  value?: V;
}

export interface IContextProviderOptions<V = any> {
  value?: V;
  children: () => void;
}
