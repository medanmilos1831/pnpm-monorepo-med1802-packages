type ScopeApi = {
  scope: ScopeFn
  beforeDispatch: (handler: BeforeDispatchHandler) => void
}

type ScopeFn = (name: string, define?: (api: ScopeApi) => void) => void

type ObserverEvent = {
  scope?: string
  type: string
  payload?: any
  src?: string
}

type EventHandler = (event: ObserverEvent) => void

type FallbackAction = 'dispatch' | 'subscribe'

type FallbackHandler = (params: {
  scope?: string
  type?: string
  action: FallbackAction
}) => void

type BeforeDispatchHandler = (
  event: ObserverEvent & { preventDefault: () => void },
) => void

type ObserverApi = {
  scope: ScopeFn
  fallback: (handler: FallbackHandler) => void
  beforeDispatch: (handler: BeforeDispatchHandler) => void
}

type DispatchParams = ObserverEvent

type SubscribeParams = {
  scope?: string
  type: string
  handler: EventHandler
  replay?: boolean | number
}

type Channel = {
  target: EventTarget
  history: ObserverEvent[]
  children: Record<string, Channel>
  beforeDispatch: BeforeDispatchHandler
}

export type {
  ScopeApi,
  ScopeFn,
  ObserverEvent,
  EventHandler,
  FallbackAction,
  FallbackHandler,
  BeforeDispatchHandler,
  ObserverApi,
  DispatchParams,
  SubscribeParams,
  Channel,
}
