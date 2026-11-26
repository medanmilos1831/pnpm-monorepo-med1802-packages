function throttle(func: Function, wait: number): Function {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: any[]) {
    if (timer) return

    func.apply(this, args)
    timer = setTimeout(() => {
      timer = null
    }, wait)
  }
}

export { throttle }
