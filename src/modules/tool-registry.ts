import type { ToolRegistryItem } from '@/lib/tool-registry'

/**
 * Font families are catalog entries rather than separate Tool Registry products.
 * Keep this empty until FontOdyssey ships a real standalone utility.
 */
export const toolRegistry = [] satisfies ReadonlyArray<ToolRegistryItem>
