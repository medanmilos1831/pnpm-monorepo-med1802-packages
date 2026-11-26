# @med1802/scroll-vue

Headless Vue 3 scroll state with axis, direction, edge detection, and a `Scroll` provider from the hook.

## Install

```bash
npm i @med1802/scroll-vue
```

Peer: `vue` (^3).

## Quick start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AXIS, useScroll } from '@med1802/scroll-vue'

const { Scroll, scrollTo, scrollToStart, scrollToEnd, useSelect } = useScroll({
  throttle: 50,
  onScrollStart: () => {},
  onScrollEnd: () => {},
})

const axis = ref(AXIS.Y)

const state = useSelect((s) => ({
  position: s.position,
  direction: s.direction,
  isStart: s.isStart,
  isEnd: s.isEnd,
  isScrolling: s.isScrolling,
}))
</script>

<template>
  <button type="button" @click="scrollToStart({ behavior: 'smooth' })">Start</button>
  <button type="button" @click="scrollTo(400, { behavior: 'smooth' })">To 400</button>
  <button type="button" @click="scrollToEnd({ behavior: 'smooth' })">End</button>

  <div style="height: 20rem">
    <Scroll :axis="axis" :remove-toolbar="true">
      <!-- scrollable content -->
    </Scroll>
  </div>

  <pre>{{ state }}</pre>
</template>
```

## API

| Export | Description |
|---|---|
| `useScroll(params?)` | Creates scroll state + `Scroll` provider component |
| `Scroll` | Viewport provider; props: `axis` (`X` \| `Y`), `removeToolbar` |
| `useSelect(selector)` | Computed projection of scroll state |
| `useScrollClient()` | Inject `{ position, scrollTo, scrollToStart, scrollToEnd }` inside `Scroll` |
| `scrollTo(value, options?)` | Scroll to position |
| `scrollToStart(options?)` | Scroll to start |
| `scrollToEnd(options?)` | Scroll to end |
| `AXIS` / `DIRECTION` | Axis and direction enums |

### `useScroll` params

| Param | Default | Description |
|---|---|---|
| `throttle` | `50` | Scroll handler throttle (ms) |
| `onScrollStart` | — | Called once when scrolling begins |
| `onScrollEnd` | — | Called after scroll idle (`throttle + 100` ms) |

## Notes

- Parent of `Scroll` needs a bounded height/width; the viewport fills that box.
- `removeToolbar` hides the scrollbar.
- Smooth scrolls update `position` via the scroll listener; `behavior: 'auto'` sets it immediately.
