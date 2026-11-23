import {
  createObserver,
  type ObserverApi,
  type SubscribeParams,
} from '@med1802/scoped-observer'
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

type ObserverClient = ReturnType<typeof createObserver>

const ObserverContext = createContext<ObserverClient | null>(null)

const OBSERVER_NOT_INSTALLED =
  '[scoped-observer/react] Observer provider is not installed. Wrap the tree with createObserverReact(...) before using useSubscribe / useDispatch.'

function createObserverReact(init: (api: ObserverApi) => void) {
  const observer = createObserver(init)

  function ObserverProvider({ children }: { children: ReactNode }) {
    return createElement(ObserverContext.Provider, { value: observer }, children)
  }

  return ObserverProvider
}

function useObserver(): ObserverClient {
  const observer = useContext(ObserverContext)
  if (!observer) {
    throw new Error(OBSERVER_NOT_INSTALLED)
  }
  return observer
}

function useSubscribe(params: SubscribeParams) {
  const observer = useObserver()
  const { scope, type, replay, handler } = params
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const unsubscribe = observer.subscribe({
      scope,
      type,
      replay,
      handler: (event) => handlerRef.current(event),
    })
    return () => {
      unsubscribe()
    }
  }, [observer, scope, type, replay])
}

function useDispatch() {
  return useObserver().dispatch
}

export { createObserverReact, useSubscribe, useDispatch, ObserverContext }
export type { ObserverClient }
