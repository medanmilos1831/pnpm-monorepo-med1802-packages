# @med1802/scoped-observer

Lightweight hierarchical event observer built on native `EventTarget`. Zero dependencies.

**Current version: 2.x** — breaking rewrite. See [Migrating from 1.x](#migrating-from-1x).

## Features

- Hierarchical scopes via a nested `scope()` DSL
- Optional event history replay (`replay: true | number`)
- Per-scope `beforeDispatch` with `preventDefault`
- Customizable `fallback` for unknown scopes
- `clear(scope?)` to wipe history for a subtree
- Zero dependencies

## Install

```bash
npm i @med1802/scoped-observer
```

## Quick start

```ts
import { createObserver } from '@med1802/scoped-observer'

const observer = createObserver(({ scope, fallback, beforeDispatch }) => {
  fallback(({ scope, type, action }) => {
    console.warn(`[observer] unknown scope "${scope}" for ${action}`, type)
  })

  beforeDispatch(({ type, src }) => {
    // root-level gate
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

observer.clear('user')
unsubscribe()
```

## Scope paths

Scopes are joined with `.`:

- `user`
- `user.profile`
- `user.settings`

Omit `scope` to target the root channel.

## API

### `createObserver(init)`

Defines the scope tree once. `init` receives:

| Method | Description |
|---|---|
| `scope(name, define?)` | Register a child scope; `define` can nest further scopes and set `beforeDispatch` |
| `beforeDispatch(handler)` | Root-level pre-dispatch hook |
| `fallback(handler)` | Called when `dispatch` / `subscribe` / `clear` target an unknown scope |

### `observer.dispatch({ scope?, type, payload?, src? })`

Runs `beforeDispatch` for that scope. If not prevented, records history (max 10) and emits.

### `observer.subscribe({ scope?, type, handler, replay? })`

- `replay` omitted / falsy — live events only
- `replay: true` — replay all buffered events of that type
- `replay: number` — replay last N buffered events of that type

Returns an unsubscribe function.

### `observer.clear(scope?)`

Clears event history for the given scope subtree, or the whole tree when omitted.

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
| — | `clear(scope?)` |
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

`createScopedObserver` is still exported as an alias of `createObserver` for naming familiarity; it uses the **v2 API**, not the 1.x signature.

## License

MIT
