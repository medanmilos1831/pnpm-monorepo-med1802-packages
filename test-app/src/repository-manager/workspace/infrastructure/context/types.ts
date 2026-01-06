export interface IContextProviderOptions<V = any> {
  value: V;
  children: () => void;
}
