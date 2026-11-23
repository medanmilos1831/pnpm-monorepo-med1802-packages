# @med1802/scoped-observer-vue

Vue 3 plugin and composables for [`@med1802/scoped-observer`](https://www.npmjs.com/package/@med1802/scoped-observer).

## Install

```bash
npm i @med1802/scoped-observer @med1802/scoped-observer-vue
```

Peers: `vue` (^3), `@med1802/scoped-observer` (^2.3).

## Quick start

```ts
import { createApp } from 'vue'
import { createObserverVue, useDispatch, useSubscribe } from '@med1802/scoped-observer-vue'

const observer = createObserverVue(({ scope, fallback }) => {
  fallback(({ scope, type, action }) => {
    console.warn(`[observer] unknown scope "${scope}" for ${action}`, type)
  })

  scope('layout', ({ scope }) => {
    scope('sidebar', ({ scope }) => {
      scope('panel')
    })
  })
})

createApp(App).use(observer).mount('#app')
```

```vue
<script setup lang="ts">
import { useDispatch, useSubscribe } from '@med1802/scoped-observer-vue'

const dispatch = useDispatch()

useSubscribe({
  scope: 'layout.sidebar.panel',
  type: 'changed',
  replay: 1,
  handler: ({ payload }) => {
    // sync UI
  },
})

function toggle() {
  dispatch({
    scope: 'layout.sidebar.panel',
    type: 'changed',
    src: 'SidebarPanel',
    payload: { collapsed: true },
  })
}
</script>
```

Install the plugin **before** any component that uses the composables.

## API

| Export | Description |
|---|---|
| `createObserverVue(init)` | Same `init` as core `createObserver`; returns a Vue plugin |
| `useDispatch()` | Returns `observer.dispatch` |
| `useSubscribe(params)` | Subscribes; unsubscribes on unmount. Supports `replay` |

Core details (`dispatch`, `subscribe`, `replay`, `destroy`, scopes) live in the [`@med1802/scoped-observer` README](https://github.com/medanmilos1831/pnpm-monorepo-med1802-packages/tree/main/med1802/scoped-observer#readme).

## Notes

- Missing plugin → throws: call `app.use(createObserverVue(...))` first.
- Does not re-export core APIs — import those from `@med1802/scoped-observer`.
