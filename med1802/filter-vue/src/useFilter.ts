import { createSys } from './createSys'
import type { FilterConfig } from './types'

function useFilter<S extends Record<string, unknown>>(params: FilterConfig<S>) {
  const sys = createSys(params)
  return {
    Field: sys.Field,
    useSelect: sys.useSelect,
    useActiveFields: sys.useActiveFields,
    reset: sys.reset,
    resetFields: sys.resetFields,
    setField: sys.setField,
  }
}

export { useFilter }
