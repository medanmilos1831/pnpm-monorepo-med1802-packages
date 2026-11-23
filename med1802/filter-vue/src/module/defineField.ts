import { defineComponent, onBeforeUnmount } from 'vue'
import {
  DEFAULT_DEBOUNCE,
  FIELD_NAME,
  type FieldComponent,
  type InternalFieldApi,
} from '../types'

function defineField<S extends Record<string, unknown>>(fields: {
  [K in keyof S]: InternalFieldApi<S[K]>
}) {
  const Field = defineComponent({
    name: FIELD_NAME,
    props: {
      name: {
        type: String,
        required: true,
      },
      debounce: {
        type: Number,
        default: DEFAULT_DEBOUNCE,
      },
    },
    setup(props, { slots }) {
      const field = fields[props.name as keyof S]

      onBeforeUnmount(() => {
        field.cancelPending()
      })

      return () =>
        slots.default?.({
          field: {
            get state() {
              return field.state
            },
            get isEmpty() {
              return field.isEmpty
            },
            reset: () => field.reset(),
            onChange: (value: S[keyof S]) => field.onChange(value, props.debounce),
          },
        })
    },
  })

  return Field as unknown as FieldComponent<S>
}

export { defineField }
