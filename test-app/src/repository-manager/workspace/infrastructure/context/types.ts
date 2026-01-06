export interface IContextConfig<V = any> {
  value?: V;
}

export interface IContextProviderOptions<V = any> {
  value: V;
  children: () => void;
}
