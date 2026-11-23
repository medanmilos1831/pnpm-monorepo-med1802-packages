# @med1802/scoped-observer

Lightweight hierarchical event observer built on native `EventTarget`. Zero dependencies.

Define a scope tree once, then `dispatch` / `subscribe` by path — useful for cross-component messaging, late subscribers, and gated events without pulling in a full state library.

**Current version: 2.x** — breaking rewrite. See [Migrating from 1.x](#migrating-from-1x).

## Features

- Hierarchical scopes via a nested `scope()` DSL
- Optional event history replay (`replay: true | number`)
- Per-scope `beforeDispatch` with `preventDefault`
- `destroy()` to unsubscribe everyone and clear all history
- Customizable `fallback` for unknown scopes
- Optional `src` on events for tracing who dispatched
- Zero dependencies — works in browser and any bundler that supports `EventTarget`

## Install

```bash
npm i @med1802/scoped-observer
```

## Mental model

```
root
└── user
    ├── profile
    └── settings
```

- Each node is an isolated channel (`EventTarget` + history).
- Paths use `.` — e.g. `user.profile`.
- Events do **not** bubble. A dispatch to `user.profile` is only heard by subscribers on `user.profile`.
- The scope tree is fixed at `createObserver(...)` time. Runtime `dispatch` / `subscribe` cannot create new scopes.

## Quick start

```ts
import { createObserver } from '@med1802/scoped-observer'

const observer = createObserver(({ scope, fallback, beforeDispatch }) => {
  fallback(({ scope, type, action }) => {
    console.warn(`[observer] unknown scope "${scope}" for ${action}`, type)
  })

  beforeDispatch(({ type, src }) => {
    // root-level gate (fires only for root dispatches)
  })

  scope('user', ({ scope }) => {
    scope('profile')
    scope('settings', ({ beforeDispatch }) => {
      beforeDispatch(({ type, preventDefault }) => {
        if (type === 'changed') preventDefault()
      })
    })
  })
})

observer.dispatch({
  scope: 'user.profile',
  type: 'changed',
  src: 'ProfileForm',
  payload: { fname: 'John' },
})

const unsubscribe = observer.subscribe({
  scope: 'user.profile',
  type: 'changed',
  replay: true,
  handler: ({ payload, src, scope, type }) => {
    console.log(payload, src, scope, type)
  },
})

unsubscribe()
```

## Scope paths

Scopes are joined with `.`:

| Path | Targets |
|---|---|
| *(omitted)* | root channel |
| `user` | `user` |
| `user.profile` | nested child |
| `user.settings` | sibling of `profile` |

`define` on `scope(name)` is optional — use a bare `scope('profile')` when you only need a leaf channel.

```ts
createObserver(({ scope }) => {
  scope('app', ({ scope }) => {
    scope('dashboard') // leaf
    scope('shell', ({ beforeDispatch, scope }) => {
      beforeDispatch(/* ... */)
      scope('nav')
    })
  })
})
```

## API

### `createObserver(init)`

Defines the scope tree once. Returns an `Observer` with `dispatch`, `subscribe`, and `destroy`.

`init` receives:

| Method | Description |
|---|---|
| `scope(name, define?)` | Register a child scope; `define` can nest further scopes and set `beforeDispatch` |
| `beforeDispatch(handler)` | Pre-dispatch hook for **this** channel (root when called from `init`) |
| `fallback(handler)` | Called when `dispatch` / `subscribe` target an unknown scope |

Only one `beforeDispatch` / `fallback` handler is kept per channel / observer — a later call replaces the previous one.

### `observer.dispatch({ scope?, type, payload?, src? })`

Flow for each dispatch:

1. Resolve the channel for `scope` (or root).
2. If missing → call `fallback({ action: 'dispatch', ... })` and return.
3. Run that channel's `beforeDispatch`. If `preventDefault()` was called → return (nothing stored, nothing emitted).
4. Append to history (max **10** events per channel, oldest dropped).
5. Emit to live subscribers.

```ts
observer.dispatch({
  scope: 'user.profile',
  type: 'changed',
  src: 'ProfileForm',
  payload: { fname: 'John' },
})

// root dispatch — omit scope
observer.dispatch({
  type: 'boot',
  payload: { version: '2.0.0' },
})
```

### `observer.subscribe({ scope?, type, handler, replay? })`

| `replay` | Behavior |
|---|---|
| omitted / falsy | live events only |
| `true` | replay all buffered events of that `type`, then listen |
| `number` | replay last N buffered events of that `type`, then listen |

Replay runs **synchronously** before the subscribe call returns. History is filtered by `type` on that channel only.

Returns an unsubscribe function. Unknown scope → `fallback({ action: 'subscribe', ... })` and a no-op unsubscribe.

```ts
// late subscriber gets the last event of this type
observer.subscribe({
  scope: 'user.profile',
  type: 'changed',
  replay: 1,
  handler: ({ payload }) => {
    // sync UI from last known state
  },
})
```

### `observer.destroy()`

Tears down the whole observer runtime (not per-scope):

1. Unsubscribes every active listener on every channel.
2. Clears event history on every channel.

The scope tree itself stays intact — later `dispatch` / `subscribe` still work on the same paths.

```ts
observer.destroy()
```

## Recipes

### Gate / validate before emit

```ts
scope('checkout', ({ beforeDispatch }) => {
  beforeDispatch(({ type, payload, preventDefault }) => {
    if (type === 'pay' && !payload?.cartId) {
      preventDefault()
    }
  })
})
```

Prevented events are not stored and not delivered to subscribers.

### Dev-only unknown-scope warnings

Default `fallback` is a silent no-op (no Vite / bundler env coupling). Wire your own:

```ts
createObserver(({ scope, fallback }) => {
  fallback(({ scope, type, action }) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[observer] ${action} on unknown scope "${scope}"`, type)
    }
  })

  scope('app')
})
```

### Trace who dispatched

```ts
observer.dispatch({
  scope: 'user.profile',
  type: 'changed',
  src: 'ProfileForm',
  payload: data,
})

observer.subscribe({
  scope: 'user.profile',
  type: 'changed',
  handler: ({ src, payload }) => {
    console.debug('updated by', src, payload)
  },
})
```

### Component mount with replay

```ts
// somewhere earlier
observer.dispatch({
  scope: 'session',
  type: 'ready',
  payload: { userId: '42' },
})

// component mounts later
onMounted(() => {
  const stop = observer.subscribe({
    scope: 'session',
    type: 'ready',
    replay: true,
    handler: ({ payload }) => {
      // fires immediately with last ready payload, then on future ready events
    },
  })
  onUnmounted(stop)
})
```

## Exported types

```ts
import type {
  Observer,
  ObserverApi,
  ObserverEvent,
  DispatchParams,
  SubscribeParams,
  ScopeApi,
  ScopeFn,
  EventHandler,
  BeforeDispatchHandler,
  FallbackHandler,
  FallbackAction,
} from '@med1802/scoped-observer'
```

`payload` is currently `any` — type it at the call site or wrap the observer in your app.

## Notes

- **No bubbling / capturing** — subscribe to the exact scope you care about.
- **History cap** — 10 events per channel (all types share one buffer; replay still filters by `type`).
- **Immutable tree** — scopes are registered only inside `createObserver(...)`; no runtime add/remove.
- **Duplicate scope names** — registering the same child name twice under one parent overwrites the previous channel.
- **`createScopedObserver`** — exported alias of `createObserver`; uses the **v2** API, not the 1.x signature.

## Migrating from 1.x

v2 is a clean break. There is no compatibility layer.

| 1.x | 2.x |
|---|---|
| `createScopedObserver([{ scope, subScopes }])` | `createObserver(({ scope }) => { scope('…') })` |
| Separator `:` (`app:dashboard`) | Separator `.` (`app.dashboard`) |
| `eventName` | `type` |
| `callback` | `handler` |
| Always replays last payload | Opt-in via `replay` |
| Silent / `console.warn` on missing scope | Silent by default; set `fallback` |
| — | `beforeDispatch` + `preventDefault` |
| — | `src` on events |

### Before (1.x)

```ts
const observer = createScopedObserver([
  {
    scope: 'app',
    subScopes: [{ scope: 'dashboard' }],
  },
])

observer.dispatch({
  scope: 'app:dashboard',
  eventName: 'updated',
  payload: { id: 1 },
})

observer.subscribe({
  scope: 'app:dashboard',
  eventName: 'updated',
  callback: ({ payload }) => console.log(payload),
})
```

### After (2.x)

```ts
const observer = createObserver(({ scope }) => {
  scope('app', ({ scope }) => {
    scope('dashboard')
  })
})

observer.dispatch({
  scope: 'app.dashboard',
  type: 'updated',
  payload: { id: 1 },
})

observer.subscribe({
  scope: 'app.dashboard',
  type: 'updated',
  replay: true,
  handler: ({ payload }) => console.log(payload),
})
```

## License

MIT
