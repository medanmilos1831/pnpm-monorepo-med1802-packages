export interface IScope<V = any> {
  provider(initialValue: V, children: () => void): void;
}
