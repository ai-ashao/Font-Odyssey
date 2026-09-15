import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import process from 'node:process'

const port = await new Promise((resolve, reject) => {
  const probe = createServer()
  probe.once('error', reject)
  probe.listen(0, '127.0.0.1', () => {
    const address = probe.address()
    if (!address || typeof address === 'string') return reject(new Error('No test port.'))
    probe.close((error) => (error ? reject(error) : resolve(address.port)))
  })
})
const baseUrl = `http://127.0.0.1:${port}`
const output = []
const server = spawn(
  'pnpm',
  ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
  {
    cwd: process.cwd(),
    env: { ...process.env, VITE_SITE_URL: baseUrl },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
)
server.stdout.on('data', (chunk) => output.push(chunk.toString()))
server.stderr.on('data', (chunk) => output.push(chunk.toString()))

function assert(value, message) {
  if (!value) throw new Error(message)
}
async function request(path) {
  const response = await fetch(`${baseUrl}${path}`)
  return { response, text: await response.text() }
}
async function waitForServer() {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${baseUrl}/api/health`)).ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  throw new Error(`Vite did not start.\n${output.join('')}`)
}
function assertHead(response, html, path) {
  const url = `${baseUrl}${path}`
  assert((html.match(/<title>/g) ?? []).length === 1, `${path} needs one title.`)
  assert(html.includes('name="description"'), `${path} needs a description.`)
  assert(html.includes(`rel="canonical" href="${url}"`), `${path} canonical mismatch.`)
  assert(
    html.includes(`property="og:image" content="${baseUrl}/og-default.png"`),
    `${path} must include the default social image.`,
  )
  assert(
    !html.includes('name="robots" content="noindex,nofollow"'),
    `${path} must not include the retired sitewide noindex directive.`,
  )
  assert(
    response.headers.get('x-robots-tag') === null,
    `${path} must not include the retired sitewide X-Robots-Tag header.`,
  )
}

try {
  await waitForServer()
  const health = await request('/api/health')
  assert(
    health.response.status === 200 && health.text.includes('"catalogFamilies":149'),
    'Health contract failed.',
  )
  assert(health.response.headers.get('x-robots-tag') === null, 'Health must be index-neutral.')
  const sitemap = await request('/sitemap.xml')
  assert(sitemap.response.status === 200, 'Sitemap failed.')
  const paths = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  )
  for (const required of ['/', '/fonts', '/about', '/contact'])
    assert(paths.includes(required), `Missing sitemap path: ${required}`)
  assert(
    !paths.some((path) => path === '/zh' || path.startsWith('/zh/')),
    'Sitemap must not expose Simplified Chinese routes.',
  )
  assert(
    !paths.some((path) => path === '/zh-tw' || path.startsWith('/zh-tw/')),
    'Sitemap must not expose Traditional Chinese routes.',
  )
  for (const path of paths) {
    const page = await request(path)
    assert(page.response.status === 200, `${path} must return 200.`)
    assertHead(page.response, page.text, path)
  }
  const home = await request('/')
  assert(home.text.includes('data-font-home'), 'Font homepage marker missing.')
  assert((home.text.match(/data-font-card=/g) ?? []).length === 12, 'Homepage must SSR 12 fonts.')
  assert(home.text.includes('href="/fonts"'), 'Homepage must link to the full directory.')
  assert(
    !home.text.includes('data-language-menu'),
    'English-only header must not render a language menu.',
  )
  assert(
    !home.text.includes('hreflang='),
    'English-only pages must not publish hreflang alternates.',
  )
  assert(
    !home.text.includes('Web preview unavailable'),
    'Homepage featured fonts must all have compliant previews.',
  )
  const socialImage = await fetch(`${baseUrl}/og-default.png`)
  assert(
    socialImage.status === 200 && socialImage.headers.get('content-type')?.startsWith('image/png'),
    'Default social image must be a public PNG.',
  )
  const directory = await request('/fonts')
  assert(
    (directory.text.match(/data-font-card=/g) ?? []).length === 149,
    'Directory must SSR 149 fonts.',
  )
  const searchedDirectory = await request('/fonts?q=Inter')
  assert(
    searchedDirectory.text.includes('name="robots" content="noindex,follow"'),
    'Directory query pages must remain noindex,follow.',
  )
  for (const removed of ['/pricing', '/login', '/dashboard', '/guides', '/tool-reference']) {
    assert(
      (await request(removed)).response.status === 404,
      `${removed} template residue must stay removed.`,
    )
  }
  for (const retiredLocalePath of [
    '/zh',
    '/zh-tw',
    '/zh/fonts',
    '/zh-tw/fonts',
    '/zh/font/inter',
    '/zh-tw/font/inter',
    '/zh/about',
    '/zh-tw/contact',
  ]) {
    assert(
      (await request(retiredLocalePath)).response.status === 404,
      `${retiredLocalePath} must stay retired.`,
    )
  }
  assert(
    (await request('/fonts/inter')).response.status === 404,
    '/fonts/inter must not become a second font-detail route.',
  )
  assert(
    (await request('/font/definitely-not-a-font')).response.status === 404,
    'Unknown font detail must return a real 404 instead of a soft-404 page.',
  )
  console.log(
    `E2E smoke passed for ${paths.length} English indexable sitemap URLs and the 149-family catalog.`,
  )
} finally {
  server.kill('SIGTERM')
  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ])
}
