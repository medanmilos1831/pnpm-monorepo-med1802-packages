type ObserverEvent = {
  scope?: string
  type: string
  payload?: any
  src?: string
}

type EventHandler = (event: ObserverEvent) => void

type BeforeDispatchHandler = (
  event: ObserverEvent & { preventDefault: () => void },
) => void

type FallbackAction = 'dispatch' | 'subscribe' | 'clear' | 'destroy'

type FallbackHandler = (params: {
  scope?: string
  type?: string
  action: FallbackAction
}) => void

type ScopeApi = {
  scope: ScopeFn
  beforeDispatch: (handler: BeforeDispatchHandler) => void
}

type ScopeFn = (name: string, define?: (api: ScopeApi) => void) => void

type ObserverApi = ScopeApi & {
  fallback: (handler: FallbackHandler) => void
}

type DispatchParams = ObserverEvent

type SubscribeParams = {
  scope?: string
  type: string
  handler: EventHandler
  replay?: boolean | number
}

type ChannelListener = {
  type: string
  listener: EventListener
}

type Channel = {
  target: EventTarget
  history: ObserverEvent[]
  children: Record<string, Channel>
  beforeDispatch: BeforeDispatchHandler
  listeners: ChannelListener[]
}

export type {
  ObserverEvent,
  EventHandler,
  BeforeDispatchHandler,
  FallbackAction,
  FallbackHandler,
  ScopeApi,
  ScopeFn,
  ObserverApi,
  DispatchParams,
  SubscribeParams,
  ChannelListener,
  Channel,
}
