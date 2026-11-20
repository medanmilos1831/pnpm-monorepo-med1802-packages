import type {
  Channel,
  DispatchParams,
  FallbackHandler,
  ObserverApi,
  ScopeFn,
  SubscribeParams,
} from './types'

const MAX_EVENT_HISTORY = 10

function createChannel(): Channel {
  return {
    target: new EventTarget(),
    history: [],
    children: {},
    beforeDispatch: () => {},
  }
}

function createObserver(init: (api: ObserverApi) => void) {
  const root = createChannel()

  let fallbackHandler: FallbackHandler = () => {}

  function defineScope(parent: Channel): ScopeFn {
    return (name, define) => {
      const channel = createChannel()
      parent.children[name] = channel
      define?.({
        scope: defineScope(channel),
        beforeDispatch(handler) {
          channel.beforeDispatch = handler
        },
      })
    }
  }

  function findChannel(scope?: string) {
    if (!scope) {
      return root
    }

    let channel = root
    for (const part of scope.split('.')) {
      const child = channel.children[part]
      if (!child) {
        return undefined
      }
      channel = child
    }

    return channel
  }

  init({
    scope: defineScope(root),
    fallback(handler) {
      fallbackHandler = handler
    },
    beforeDispatch(handler) {
      root.beforeDispatch = handler
    },
  })

  return {
    dispatch({ scope, type, payload, src }: DispatchParams) {
      const channel = findChannel(scope)
      if (!channel) {
        fallbackHandler({ scope, type, action: 'dispatch' })
        return
      }

      let prevented = false
      channel.beforeDispatch({
        scope,
        type,
        payload,
        src,
        preventDefault() {
          prevented = true
        },
      })
      if (prevented) {
        return
      }

      channel.history.push({ type, payload, src, scope })
      if (channel.history.length > MAX_EVENT_HISTORY) {
        channel.history.shift()
      }

      channel.target.dispatchEvent(
        new CustomEvent(type, { detail: { payload, src } }),
      )
    },
    subscribe({ scope, type, handler, replay }: SubscribeParams) {
      const channel = findChannel(scope)
      if (!channel) {
        fallbackHandler({ scope, type, action: 'subscribe' })
        return () => {}
      }

      if (replay) {
        const events = channel.history.filter((event) => event.type === type)
        const count = replay === true ? events.length : replay
        for (const event of events.slice(-count)) {
          handler({
            payload: event.payload,
            src: event.src,
            scope,
            type,
          })
        }
      }

      const listener = (event: Event) => {
        const { payload, src } = (event as CustomEvent).detail
        handler({ payload, src, scope, type })
      }

      channel.target.addEventListener(type, listener)
      return () => {
        channel.target.removeEventListener(type, listener)
      }
    },
  }
}

type Observer = ReturnType<typeof createObserver>

/** @deprecated Use `createObserver`. Alias kept for package naming familiarity. */
const createScopedObserver = createObserver

export { createObserver, createScopedObserver }
export type { Observer }
