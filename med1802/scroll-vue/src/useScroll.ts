import { computed, defineComponent, h, onUnmounted, provide, ref, watch } from 'vue'
import { throttle } from './throttle'
import {
  AXIS,
  DEFAULT_SCROLL_POSITION,
  DIRECTION,
  SCROLL_KEY,
  type ScrollState,
  type ScrollToOptions,
} from './types'
import ScrollRoot from './Scroll'

type UseScrollParams = {
  throttle?: number
  onScrollStart?: () => void
  onScrollEnd?: () => void
}

function useScroll(params?: UseScrollParams) {
  const throttleMs = params?.throttle ?? 50
  const onScrollStart = params?.onScrollStart
  const onScrollEnd = params?.onScrollEnd
  const viewport = ref<HTMLElement | null>(null)
  const axis = ref(AXIS.Y)
  const position = ref(DEFAULT_SCROLL_POSITION)
  const direction = ref(DIRECTION.DOWN)
  const isScrolling = ref(false)
  let scrollIdleTimer: ReturnType<typeof setTimeout> | undefined

  function markScrolling() {
    if (!isScrolling.value) {
      isScrolling.value = true
      onScrollStart?.()
    }
    clearTimeout(scrollIdleTimer)
    scrollIdleTimer = setTimeout(() => {
      isScrolling.value = false
      onScrollEnd?.()
    }, throttleMs + 100)
  }

  function setDirection(next: number) {
    if (next === position.value) return
    direction.value =
      axis.value === AXIS.X
        ? next > position.value
          ? DIRECTION.RIGHT
          : DIRECTION.LEFT
        : next > position.value
          ? DIRECTION.DOWN
          : DIRECTION.UP
  }

  watch(axis, (next) => {
    position.value = DEFAULT_SCROLL_POSITION
    direction.value = next === AXIS.X ? DIRECTION.LEFT : DIRECTION.DOWN
    isScrolling.value = false
    clearTimeout(scrollIdleTimer)
  })

  onUnmounted(() => clearTimeout(scrollIdleTimer))

  const onScroll = throttle((event: Event) => {
    const el = event.currentTarget as HTMLElement
    const next = axis.value === AXIS.X ? el.scrollLeft : el.scrollTop
    setDirection(next)
    position.value = next
    markScrolling()
  }, throttleMs)

  function setViewport(el: unknown) {
    viewport.value = el instanceof HTMLElement ? el : null
  }

  function scrollTo(value: number, options?: ScrollToOptions) {
    const behavior = options?.behavior ?? 'auto'
    const el = viewport.value
    if (!el) return

    el.scrollTo(
      axis.value === AXIS.X ? { left: value, behavior } : { top: value, behavior },
    )

    if (value !== position.value) {
      setDirection(value)
      markScrolling()
    }

    // Smooth scrolls update position via `onScroll`; instant jumps set it now.
    if (behavior === 'auto') {
      position.value = value
    }
  }

  function scrollToStart(options?: ScrollToOptions) {
    scrollTo(0, options)
  }

  function scrollToEnd(options?: ScrollToOptions) {
    const el = viewport.value
    if (!el) return
    scrollTo(
      axis.value === AXIS.X
        ? el.scrollWidth - el.clientWidth
        : el.scrollHeight - el.clientHeight,
      options,
    )
  }

  function useSelect<R>(callback: (state: ScrollState) => R) {
    return computed(() => {
      const el = viewport.value
      const max = el
        ? axis.value === AXIS.X
          ? el.scrollWidth - el.clientWidth
          : el.scrollHeight - el.clientHeight
        : 0

      return callback({
        position: position.value,
        axis: axis.value,
        direction: direction.value,
        isStart: position.value <= 0,
        isEnd: max <= 0 || position.value >= max - 1,
        isScrolling: isScrolling.value,
      })
    })
  }

  const Scroll = defineComponent({
    name: 'Scroll',
    props: {
      axis: {
        type: String as () => AXIS,
        default: AXIS.Y,
        validator: (value: string) => value === AXIS.X || value === AXIS.Y,
      },
      removeToolbar: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { slots }) {
      watch(
        () => props.axis,
        (next) => {
          axis.value = next
        },
        { immediate: true },
      )

      provide(SCROLL_KEY, {
        position,
        scrollTo,
        scrollToStart,
        scrollToEnd,
      })
      return () =>
        h(
          ScrollRoot,
          {
            setViewport,
            onScroll: onScroll as (event: Event) => void,
            axis: props.axis,
            removeToolbar: props.removeToolbar,
          },
          slots,
        )
    },
  })

  return { Scroll, position, scrollTo, scrollToStart, scrollToEnd, useSelect }
}

export { useScroll }
export type { UseScrollParams }
