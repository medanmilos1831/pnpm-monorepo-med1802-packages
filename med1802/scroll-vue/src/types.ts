import type { InjectionKey, Ref } from 'vue'

export enum AXIS {
  X = 'X',
  Y = 'Y',
}

export enum DIRECTION {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export type ScrollPosition = number

export type ScrollToOptions = Pick<ScrollOptions, 'behavior'>

export type ScrollState = {
  position: ScrollPosition
  axis: AXIS
  direction: DIRECTION
  isStart: boolean
  isEnd: boolean
  isScrolling: boolean
}

export type ScrollContext = {
  position: Ref<ScrollPosition>
  scrollTo: (value: number, options?: ScrollToOptions) => void
  scrollToStart: (options?: ScrollToOptions) => void
  scrollToEnd: (options?: ScrollToOptions) => void
}

export const SCROLL_KEY: InjectionKey<ScrollContext> = Symbol('Scroll')

export const DEFAULT_SCROLL_POSITION: ScrollPosition = 0
