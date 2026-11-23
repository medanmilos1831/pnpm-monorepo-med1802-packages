import { reactive } from 'vue'
import type { InternalFieldApi } from '../types'

function createFields<S extends Record<string, unknown>>(defaults: S) {
  const __INIT__ = structuredClone(defaults)
  const state = reactive(structuredClone(__INIT__)) as S
  const fields = {} as { [K in keyof S]: InternalFieldApi<S[K]> }

  for (const key in __INIT__) {
    let timer: ReturnType<typeof setTimeout> | null = null

    function cancelPending() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    fields[key] = {
      get state() {
        return state[key]
      },
      get isEmpty() {
        const value = state[key]
        if (value === null || value === undefined || value === '') return true
        if (Array.isArray(value)) return value.length === 0
        return false
      },
      cancelPending,
      reset() {
        cancelPending()
        state[key] = structuredClone(__INIT__[key])
      },
      onChange(value, debounceMs = 0) {
        cancelPending()
        if (!debounceMs) {
          state[key] = value
          return
        }
        timer = setTimeout(() => {
          timer = null
          state[key] = value
        }, debounceMs)
      },
    }
  }

  return { state, fields }
}

export { createFields }
