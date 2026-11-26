import { inject } from 'vue'
import { SCROLL_KEY } from './types'

function useScrollClient() {
  const context = inject(SCROLL_KEY)
  if (!context) {
    throw new Error('useScrollClient() must be used within Scroll')
  }

  const { position, scrollTo, scrollToStart, scrollToEnd } = context
  return { position, scrollTo, scrollToStart, scrollToEnd }
}

export { useScrollClient }
