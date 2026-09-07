import { type ProductConfig, productConfig } from '@/lib/product-config'
import { type ToolSeoBrief, validateToolSeoBriefForProduct } from '@/lib/tool-seo-brief'
import { toolSeoBrief } from '@/modules/tool-seo-brief'

export function validateSeoFirstState(input: {
  config: ProductConfig
  brief: ToolSeoBrief | null
}): ReadonlyArray<string> {
  return validateToolSeoBriefForProduct(input.config, input.brief)
}

export function validateSeoFirstProductState(): ReadonlyArray<string> {
  return validateSeoFirstState({
    config: productConfig,
    brief: toolSeoBrief,
  })
}
