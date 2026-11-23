import type { VNode } from 'vue'

const FIELD_NAME = 'Field' as const
const DEFAULT_DEBOUNCE = 300

interface FilterConfig<S extends Record<string, unknown> = Record<string, unknown>> {
  defaults: S
}

interface FieldApi<T> {
  get state(): T
  get isEmpty(): boolean
  reset(): void
  onChange(value: T): void
}

interface InternalFieldApi<T> extends FieldApi<T> {
  cancelPending(): void
  onChange(value: T, debounceMs?: number): void
}

interface ActiveField<T = unknown> {
  name: string
  value: T
  reset: () => void
}

type FieldComponent<S extends Record<string, unknown>> = new <N extends keyof S>(props: {
  name: N
  debounce?: number
}) => {
  $props: {
    name: N
    debounce?: number
  }
  $slots: {
    default: (props: { field: FieldApi<S[N]> }) => VNode[]
  }
}

export {
  FIELD_NAME,
  DEFAULT_DEBOUNCE,
  type FieldApi,
  type InternalFieldApi,
  type ActiveField,
  type FieldComponent,
  type FilterConfig,
}
