import { createMiddleware, createStart } from '@tanstack/react-start'
import { productConfig } from '@/lib/product-config'

const securityHeaders = createMiddleware({ type: 'request' }).server(async ({ next, request }) => {
  const requestHostname = new URL(request.url).hostname
  const isWorkersDevHost = requestHostname.endsWith('.workers.dev')
  const result = await next()
  const headers = new Headers(result.response.headers)
  headers.set(
    'content-security-policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://assets.fontodyssey.com",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "connect-src 'self' https://www.google-analytics.com",
    ].join('; '),
  )
  headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()')
  headers.set('referrer-policy', 'strict-origin-when-cross-origin')
  headers.set('x-content-type-options', 'nosniff')
  headers.set('x-frame-options', 'DENY')
  if (!productConfig.indexingEnabled || isWorkersDevHost) {
    headers.set('x-robots-tag', 'noindex, nofollow')
  }

  return {
    ...result,
    response: new Response(result.response.body, {
      status: result.response.status,
      statusText: result.response.statusText,
      headers,
    }),
  }
})

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeaders],
}))
