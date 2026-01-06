export interface IScope<V = any> {
  provider(options: IScopeProviderOptions<V>): void;
  get currentValue(): V;
}

export interface IScopeProviderOptions<V = any> {
  value: V;
  children: () => void;
}
