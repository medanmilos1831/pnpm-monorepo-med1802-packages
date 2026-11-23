# @med1802/filter-vue

Headless Vue 3 filter state with typed `Field` slots, debounce, and active-field helpers.

## Install

```bash
npm i @med1802/filter-vue
```

Peer: `vue` (^3).

## Quick start

```vue
<script setup lang="ts">
import { useFilter } from '@med1802/filter-vue'

const { Field, useSelect, useActiveFields, reset, resetFields } = useFilter({
  defaults: {
    fname: '',
    lname: '',
    age: null as number | null,
  },
})

const state = useSelect((s) => s)
const activeFields = useActiveFields((fields) => fields)
</script>

<template>
  <Field name="fname" v-slot="{ field }">
    <label>
      First name
      <input
        :value="field.state"
        @input="field.onChange(($event.target as HTMLInputElement).value)"
      />
    </label>
  </Field>

  <Field name="lname" v-slot="{ field }">
    <label>
      Last name
      <input
        :value="field.state"
        @input="field.onChange(($event.target as HTMLInputElement).value)"
      />
    </label>
  </Field>

  <Field name="age" :debounce="0" v-slot="{ field }">
    <label>
      Age
      <input
        type="number"
        :value="field.state ?? ''"
        @input="
          field.onChange(
            ($event.target as HTMLInputElement).value === ''
              ? null
              : Number(($event.target as HTMLInputElement).value),
          )
        "
      />
    </label>
  </Field>

  <button type="button" @click="reset">Reset all</button>
  <button type="button" @click="resetFields(['fname', 'lname'])">Reset names</button>

  <ul>
    <li v-for="item in activeFields" :key="item.name">
      {{ item.name }}: {{ item.value }}
      <button type="button" @click="item.reset()">Clear</button>
    </li>
  </ul>

  <pre>{{ state }}</pre>
</template>
```

## API

| Export | Description |
|---|---|
| `useFilter({ defaults })` | Creates filter state + `Field` component |
| `Field` | Headless slot field; supports `name`, `debounce` (default `300`) |
| `useSelect(selector)` | Computed projection of filter state |
| `useActiveFields(selector)` | Computed list of non-empty fields |
| `reset()` | Reset all fields |
| `resetFields(keys)` | Reset listed fields |
| `setField(key, value)` | Set one field immediately |

## Notes

- `isEmpty`: `null`, `undefined`, `''`, and `[]` count as empty.
- Defaults should be `structuredClone`-friendly (primitives, plain objects/arrays, etc.).
- Debounce lives on each field; `reset` / `onChange` cancel pending timers.
