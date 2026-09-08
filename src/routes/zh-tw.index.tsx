import { createFileRoute } from '@tanstack/react-router'
import { ProductHome, productHomeHead } from '@/components/product-home'

export const Route = createFileRoute('/zh-tw/')({
  head: () => productHomeHead('zh-TW'),
  component: HomePage,
})

function HomePage() {
  return <ProductHome locale="zh-TW" />
}
