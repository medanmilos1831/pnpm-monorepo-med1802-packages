import type {
  Channel,
  DispatchParams,
  EventHandler,
  FallbackAction,
  FallbackHandler,
  ObserverApi,
  ObserverEvent,
  ScopeApi,
  SubscribeParams,
} from './types'

const MAX_EVENT_HISTORY = 10
const SCOPE_SEPARATOR = '.'

const defaultFallback: FallbackHandler = () => {}

function createChannel(): Channel {
  return {
    target: new EventTarget(),
    history: [],
    children: {},
    beforeDispatch: () => {},
  }
}

function createScopeApi(channel: Channel): ScopeApi {
  return {
    scope(name, define) {
      const child = createChannel()
      channel.children[name] = child
      define?.(createScopeApi(child))
    },
    beforeDispatch(handler) {
      channel.beforeDispatch = handler
    },
  }
}

function findChannel(root: Channel, scope?: string) {
  if (!scope) {
    return root
  }

  let channel: Channel | undefined = root
  for (const name of scope.split(SCOPE_SEPARATOR)) {
    channel = channel.children[name]
    if (!channel) {
      return undefined
    }
  }

  return channel
}

function isPrevented(channel: Channel, event: ObserverEvent) {
  let prevented = false
  channel.beforeDispatch({
    ...event,
    preventDefault() {
      prevented = true
    },
  })
  return prevented
}

function record(channel: Channel, event: ObserverEvent) {
  channel.history.push(event)
  if (channel.history.length > MAX_EVENT_HISTORY) {
    channel.history.shift()
  }
}

function emit(channel: Channel, event: ObserverEvent) {
  channel.target.dispatchEvent(new CustomEvent(event.type, { detail: event }))
}

function replayHistory(
  channel: Channel,
  type: string,
  replay: true | number,
  handler: EventHandler,
) {
  const events = channel.history.filter((event) => event.type === type)
  const count = replay === true ? events.length : replay
  events.slice(-count).forEach(handler)
}

function listen(channel: Channel, type: string, handler: EventHandler) {
  const listener = (event: Event) =>
    handler((event as CustomEvent<ObserverEvent>).detail)
  channel.target.addEventListener(type, listener)
  return () => channel.target.removeEventListener(type, listener)
}

function createObserver(init: (api: ObserverApi) => void) {
  const root = createChannel()
  let fallback = defaultFallback

  init({
    ...createScopeApi(root),
    fallback(handler) {
      fallback = handler
    },
  })

  function resolve(action: FallbackAction, scope?: string, type?: string) {
    const channel = findChannel(root, scope)
    if (!channel) {
      fallback({ scope, type, action })
    }
    return channel
  }

  return {
    dispatch({ scope, type, payload, src }: DispatchParams) {
      const event: ObserverEvent = { scope, type, payload, src }
      const channel = resolve('dispatch', scope, type)
      if (!channel || isPrevented(channel, event)) {
        return
      }

      record(channel, event)
      emit(channel, event)
    },
    subscribe({ scope, type, handler, replay }: SubscribeParams) {
      const channel = resolve('subscribe', scope, type)
      if (!channel) {
        return () => {}
      }

      if (replay) {
        replayHistory(channel, type, replay, handler)
      }
      return listen(channel, type, handler)
    },
  }
}

type Observer = ReturnType<typeof createObserver>

/** @deprecated Use `createObserver`. Alias kept for package naming familiarity. */
const createScopedObserver = createObserver

export { createObserver, createScopedObserver }
export type { Observer }
