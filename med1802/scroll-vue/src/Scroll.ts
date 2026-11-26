import { defineComponent, h, type PropType } from 'vue'
import { ensureStyles } from './styles'
import { AXIS } from './types'

const ScrollRoot = defineComponent({
  name: 'ScrollRoot',
  props: {
    setViewport: {
      type: Function as PropType<(el: unknown) => void>,
      required: true,
    },
    onScroll: {
      type: Function as PropType<(event: Event) => void>,
      required: true,
    },
    axis: {
      type: String as PropType<AXIS>,
      default: AXIS.Y,
    },
    removeToolbar: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    ensureStyles()

    return () =>
      h('div', { class: 'scroll-root' }, [
        h(
          'div',
          {
            ref: props.setViewport,
            class: [
              'scroll-viewport',
              props.axis === AXIS.X ? 'scroll-viewport--x' : 'scroll-viewport--y',
              { 'scroll-viewport--no-toolbar': props.removeToolbar },
            ],
            onScroll: props.onScroll,
          },
          slots.default?.(),
        ),
      ])
  },
})

export default ScrollRoot
