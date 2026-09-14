import { createMiddleware, createStart } from '@tanstack/react-start'
import { canonicalRedirectUrl, isCanonicalHttpsUrl } from '@/lib/canonical-host'
import { productConfig } from '@/lib/product-config'

const securityHeaders = createMiddleware({ type: 'request' }).server(async ({ next, request }) => {
  const requestUrl = new URL(request.url)
  const redirectUrl = canonicalRedirectUrl(request.url)
  if (redirectUrl) {
    return new Response(null, {
      status: 308,
      headers: {
        location: redirectUrl,
        'cache-control': 'public, max-age=3600',
      },
    })
  }

  const requestHostname = requestUrl.hostname
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
  if (isCanonicalHttpsUrl(request.url)) {
    headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains')
  }
  if (!productConfig.indexingEnabled || isWorkersDevHost) {
    headers.set('x-robots-tag', 'noindex, nofollow')
  } else {
    headers.delete('x-robots-tag')
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
