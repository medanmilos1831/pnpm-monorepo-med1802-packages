import type {
  DispatchParams,
  Observer,
  SubscribeParams,
} from '@med1802/scoped-observer'

type PublishInterceptor = (params: {
  type: string
  payload?: any
}) => { type: string; payload?: any } | null | false

type SubscribeInterceptor = (params: {
  type: string
}) => { type: string } | null | false

function interceptorKey(scope: string | undefined, type: string) {
  return scope ? `${scope}.${type}` : type
}

function createMessageBroker(observer: Observer) {
  const publishInterceptors = new Map<string, PublishInterceptor[]>()
  const subscribeInterceptors = new Map<string, SubscribeInterceptor>()

  return {
    interceptor({
      scope,
      type,
      onPublish,
      onSubscribe,
    }: {
      scope?: string
      type: string
      onPublish?: PublishInterceptor
      onSubscribe?: SubscribeInterceptor
    }) {
      const key = interceptorKey(scope, type)

      if (onPublish) {
        const existing = publishInterceptors.get(key) || []
        existing.push(onPublish)
        publishInterceptors.set(key, existing)
      }
      if (onSubscribe) {
        subscribeInterceptors.set(key, onSubscribe)
      }

      return () => {
        publishInterceptors.delete(key)
        subscribeInterceptors.delete(key)
      }
    },
    publish({ scope, type, payload, src }: DispatchParams) {
      let currentType = type
      let currentPayload = payload

      const scopedKey = scope ? interceptorKey(scope, currentType) : undefined
      const interceptors = scopedKey
        ? publishInterceptors.get(scopedKey) ||
          publishInterceptors.get(currentType) ||
          []
        : publishInterceptors.get(currentType) || []

      for (const interceptor of interceptors) {
        const result = interceptor({
          type: currentType,
          payload: currentPayload,
        })

        if (result === null || result === false) {
          return
        }

        currentType = result.type
        currentPayload = result.payload
      }

      observer.dispatch({
        scope,
        type: currentType,
        payload: currentPayload,
        src,
      })
    },
    subscribe({ scope, type, handler, replay }: SubscribeParams) {
      const scopedKey = scope ? interceptorKey(scope, type) : undefined
      const interceptor = scopedKey
        ? subscribeInterceptors.get(scopedKey) ||
          subscribeInterceptors.get(type)
        : subscribeInterceptors.get(type)

      let currentType = type
      if (interceptor) {
        const result = interceptor({ type })
        if (result === null || result === false) {
          return () => {}
        }
        currentType = result.type
      }

      return observer.subscribe({
        scope,
        type: currentType,
        handler,
        replay,
      })
    },
  }
}

type MessageBroker = ReturnType<typeof createMessageBroker>

export { createMessageBroker }
export type { MessageBroker, PublishInterceptor, SubscribeInterceptor }
