# @med1802/scoped-observer-vue

Vue 3 plugin and composables for [`@med1802/scoped-observer`](https://www.npmjs.com/package/@med1802/scoped-observer).

## Install

```bash
npm i @med1802/scoped-observer @med1802/scoped-observer-vue
```

Peer dependencies: `vue` (^3), `@med1802/scoped-observer` (^2.3).

## Quick start

```ts
import { createApp } from 'vue'
import { createObserverVue, useDispatch, useSubscribe } from '@med1802/scoped-observer-vue'

const observer = createObserverVue(({ scope }) => {
  scope('layout', ({ scope }) => {
    scope('sidebar')
  })
})

createApp(App).use(observer).mount('#app')
```

```ts
// in a component
const dispatch = useDispatch()
useSubscribe({
  scope: 'layout.sidebar',
  type: 'changed',
  handler: ({ payload }) => {},
})
```

## API

| Export | Description |
|---|---|
| `createObserverVue(init)` | Builds a Vue plugin that provides the observer |
| `useDispatch()` | Returns `observer.dispatch` |
| `useSubscribe(params)` | Subscribes and unsubscribes on unmount |
| `OBSERVER_KEY` | Injection key |
