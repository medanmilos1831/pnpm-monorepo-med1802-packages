type ScopeNodeType = ScopeNode[];

type scopedObserverDispatchType = {
  scope?: string;
  eventName: string;
  payload?: any;
};
type scopedObserverSubscribeType = {
  scope?: string;
  eventName: string;
  callback: (payload: any) => void;
};
export type ScopeNode = {
  scope: string;
  subScopes?: ScopeNode[];
};

export const ROOT_SCOPE = "root";
export {
  type ScopeNodeType,
  type scopedObserverDispatchType,
  type scopedObserverSubscribeType,
};
