import type { Observer } from '@med1802/scoped-observer'
import type { IRepositoryConfig, ISignalBroadcaster } from '../types'

function createSignalBroadcaster(config: {
  observer: Observer
  repositoryConfig: IRepositoryConfig
}): ISignalBroadcaster {
  const { observer, repositoryConfig } = config
  return {
    signal({ repositoryId, type, message }) {
      if (repositoryId === repositoryConfig.id) {
        console.warn('WARNING: DISPATCHING TO SELF')
        return
      }
      observer.dispatch({
        scope: repositoryId,
        type: 'dispatch',
        payload: {
          type,
          message,
          source: repositoryConfig.id,
        },
      })
    },
    subscribe(handler) {
      return observer.subscribe({
        scope: repositoryConfig.id,
        type: 'dispatch',
        replay: true,
        handler({ payload }) {
          const { type, message, source } = payload
          handler({
            type,
            message: message ?? undefined,
            source,
          })
        },
      })
    },
  }
}

export { createSignalBroadcaster }
