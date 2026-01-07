export interface IScope<V = any> {
  provider(options: IScopeProviderOptions<V>): void;
}

export interface IScopeProviderOptions<V = any> {
  value: V;
  children: () => void;
}
