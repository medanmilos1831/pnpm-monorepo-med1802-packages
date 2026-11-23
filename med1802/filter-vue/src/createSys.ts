import { computed } from 'vue'
import { createFields, defineField } from './module'
import type { ActiveField } from './types'

function createSys<S extends Record<string, unknown>>(params: { defaults: S }) {
  const { state, fields } = createFields(params.defaults)
  const Field = defineField<S>(fields)

  function getState() {
    return { ...state }
  }

  function getField(key: keyof S) {
    return fields[key]
  }

  function reset() {
    for (const key in fields) {
      fields[key].reset()
    }
  }

  function resetFields(keys: (keyof S)[]) {
    keys.forEach((key) => fields[key].reset())
  }

  function setField<K extends keyof S>(key: K, value: S[K]) {
    fields[key].onChange(value)
  }

  function setState(callback: (state: S) => S) {
    const value = callback(getState())
    for (const key in fields) {
      fields[key].onChange(value[key])
    }
  }

  function useSelect<R>(callback: (state: S) => R) {
    return computed(() => callback(state))
  }

  function useActiveFields<R>(callback: (fields: ActiveField<S[keyof S]>[]) => R) {
    return computed(() =>
      callback(
        Object.entries(fields)
          .filter(([, field]) => !field.isEmpty)
          .map(([name, field]) => ({
            name,
            value: field.state,
            reset: field.reset,
          })),
      ),
    )
  }

  return {
    Field,
    state,
    getField,
    reset,
    resetFields,
    setField,
    setState,
    useSelect,
    useActiveFields,
  }
}

export { createSys }
