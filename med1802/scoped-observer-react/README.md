# @med1802/scoped-observer-react

React provider and hooks for [`@med1802/scoped-observer`](https://www.npmjs.com/package/@med1802/scoped-observer).

## Install

```bash
npm i @med1802/scoped-observer @med1802/scoped-observer-react
```

Peers: `react` (^18 || ^19), `@med1802/scoped-observer` (^2.3).

## Quick start

```tsx
import { createRoot } from 'react-dom/client'
import { createObserverReact, useDispatch, useSubscribe } from '@med1802/scoped-observer-react'

const ObserverProvider = createObserverReact(({ scope, fallback }) => {
  fallback(({ scope, type, action }) => {
    console.warn(`[observer] unknown scope "${scope}" for ${action}`, type)
  })

  scope('layout', ({ scope }) => {
    scope('sidebar', ({ scope }) => {
      scope('panel')
    })
  })
})

createRoot(document.getElementById('root')!).render(
  <ObserverProvider>
    <App />
  </ObserverProvider>,
)
```

```tsx
import { useDispatch, useSubscribe } from '@med1802/scoped-observer-react'

function SidebarPanel() {
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

  return <button onClick={toggle}>Toggle</button>
}
```

Wrap the tree with the provider **before** any component that uses the hooks.

## API

| Export | Description |
|---|---|
| `createObserverReact(init)` | Same `init` as core `createObserver`; returns an `ObserverProvider` |
| `useDispatch()` | Returns `observer.dispatch` |
| `useSubscribe(params)` | Subscribes; unsubscribes on unmount. Supports `replay`. Handler identity is stable via ref |

Core details (`dispatch`, `subscribe`, `replay`, `destroy`, scopes) live in the [`@med1802/scoped-observer` README](https://github.com/medanmilos1831/pnpm-monorepo-med1802-packages/tree/main/med1802/scoped-observer#readme).

## Notes

- Missing provider → throws: wrap with `createObserverReact(...)` first.
- Does not re-export core APIs — import those from `@med1802/scoped-observer`.
