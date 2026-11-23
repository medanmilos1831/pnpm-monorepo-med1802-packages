import {
  createObserver,
  type ObserverApi,
  type SubscribeParams,
} from '@med1802/scoped-observer'
import { inject, onBeforeUnmount, type App, type InjectionKey } from 'vue'

type ObserverClient = ReturnType<typeof createObserver>

const OBSERVER_KEY: InjectionKey<ObserverClient> = Symbol('observer')

const OBSERVER_NOT_INSTALLED =
  '[scoped-observer/vue] Observer plugin is not installed. Call app.use(createObserverVue(...)) before using useSubscribe / useDispatch.'

function createObserverVue(init: (api: ObserverApi) => void) {
  const observer = createObserver(init)
  return {
    install(app: App) {
      app.provide(OBSERVER_KEY, observer)
    },
  }
}

function useSubscribe(params: SubscribeParams) {
  const observer = inject(OBSERVER_KEY)
  if (!observer) {
    throw new Error(OBSERVER_NOT_INSTALLED)
  }
  const unsubscribe = observer.subscribe(params)
  onBeforeUnmount(() => {
    unsubscribe()
  })
}

function useDispatch() {
  const observer = inject(OBSERVER_KEY)
  if (!observer) {
    throw new Error(OBSERVER_NOT_INSTALLED)
  }
  return observer.dispatch
}

export { createObserverVue, useSubscribe, useDispatch, OBSERVER_KEY }
export type { ObserverClient }
