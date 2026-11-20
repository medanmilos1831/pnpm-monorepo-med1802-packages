# @med1802/scoped-observer-message-broker

Publish/subscribe broker on top of `@med1802/scoped-observer` v2.  
Same scoped event model, plus per-event interceptors to validate, transform, or block traffic.

**Current version: 3.x** — requires `@med1802/scoped-observer@^2`. See [Migrating from 2.x](#migrating-from-2x).

## Features

- Scoped messaging via any `createObserver` instance
- Per-event `onPublish` / `onSubscribe` interceptors
- Interceptors can rewrite `type` / `payload` or abort with `null` / `false`
- Peer dependency — you control the observer version

## Install

```bash
npm i @med1802/scoped-observer @med1802/scoped-observer-message-broker
```

## Quick start

```ts
import { createObserver } from '@med1802/scoped-observer'
import { createMessageBroker } from '@med1802/scoped-observer-message-broker'

const observer = createObserver(({ scope }) => {
  scope('app')
})

const broker = createMessageBroker(observer)

broker.interceptor({
  type: 'increment',
  onPublish: ({ type, payload }) => ({
    type,
    payload: {
      incrementBy: payload,
      timestamp: Date.now(),
    },
  }),
})

broker.subscribe({
  type: 'increment',
  handler: ({ payload }) => {
    console.log(payload)
  },
})

broker.publish({
  type: 'increment',
  payload: 1,
})
```

## API

### `createMessageBroker(observer)`

| Method | Description |
|---|---|
| `publish({ scope?, type, payload?, src? })` | Run publish interceptors, then `observer.dispatch` |
| `subscribe({ scope?, type, handler, replay? })` | Run subscribe interceptor, then `observer.subscribe` |
| `interceptor({ scope?, type, onPublish?, onSubscribe? })` | Register interceptors; returns cleanup |

Interceptor lookup: scoped key `scope.type` first, then global `type`.

### Interceptors

```ts
broker.interceptor({
  scope: 'app',
  type: 'increment',
  onPublish: ({ type, payload }) => {
    if (payload == null) return null // block
    return { type, payload: { ...payload, at: Date.now() } }
  },
  onSubscribe: ({ type }) => ({ type }), // or rewrite / return null to block
})
```

## Migrating from 2.x

| 2.x (observer 1.x) | 3.x (observer 2.x) |
|---|---|
| `createScopedObserver()` | `createObserver(({ scope }) => { … })` |
| `eventName` | `type` |
| `callback` | `handler` |
| Interceptor key `scope:eventName` | `scope.type` |
| peer `@med1802/scoped-observer@^1` | `^2.0.0` |

## License

MIT
