export type ProductMode = 'saas' | 'tool'

export type ProductConfig = {
  mode: ProductMode
  brand: {
    name: string
    mark: string
    description: string
  }
}

/**
 * Product identity remains centralized so the shell, metadata, and legal pages agree.
 */
export const productConfig: ProductConfig = {
  mode: 'tool',
  brand: {
    name: 'FontOdyssey',
    mark: 'FO',
    description: 'A small, carefully curated collection of popular multilingual fonts.',
  },
}

export function validateProductConfig(config: ProductConfig): ReadonlyArray<string> {
  const issues: string[] = []

  if (!config.brand.name.trim()) issues.push('Product brand name is required.')
  if (!config.brand.description.trim()) issues.push('Product brand description is required.')

  const markLength = [...config.brand.mark.trim()].length
  if (markLength < 1 || markLength > 3) {
    issues.push('Product brand mark must contain 1–3 visible characters.')
  }

  return issues
}

export function surfaceModeForPath(pathname: string): ProductMode {
  void pathname
  return productConfig.mode
}
