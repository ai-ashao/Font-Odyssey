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
function assertHead(html, path) {
  const url = `${baseUrl}${path}`
  assert((html.match(/<title>/g) ?? []).length === 1, `${path} needs one title.`)
  assert(html.includes('name="description"'), `${path} needs a description.`)
  assert(html.includes(`rel="canonical" href="${url}"`), `${path} canonical mismatch.`)
  assert(!html.includes('noindex,nofollow'), `${path} must be indexable.`)
}

try {
  await waitForServer()
  const health = await request('/api/health')
  assert(
    health.response.status === 200 && health.text.includes('"catalogFamilies":149'),
    'Health contract failed.',
  )
  const sitemap = await request('/sitemap.xml')
  assert(sitemap.response.status === 200, 'Sitemap failed.')
  const paths = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  )
  for (const required of ['/', '/zh', '/fonts', '/zh/fonts', '/about', '/contact'])
    assert(paths.includes(required), `Missing sitemap path: ${required}`)
  for (const path of paths) {
    const page = await request(path)
    assert(page.response.status === 200, `${path} must return 200.`)
    assertHead(page.text, path)
  }
  const home = await request('/')
  assert(home.text.includes('data-font-home'), 'Font homepage marker missing.')
  assert((home.text.match(/data-font-card=/g) ?? []).length === 12, 'Homepage must SSR 12 fonts.')
  assert(home.text.includes('href="/fonts"'), 'Homepage must link to the full directory.')
  const directory = await request('/fonts')
  assert(
    (directory.text.match(/data-font-card=/g) ?? []).length === 149,
    'Directory must SSR 149 fonts.',
  )
  for (const removed of ['/pricing', '/login', '/dashboard', '/guides', '/tool-reference']) {
    assert(
      (await request(removed)).response.status === 404,
      `${removed} template residue must stay removed.`,
    )
  }
  for (const duplicate of ['/fonts/inter', '/zh/fonts/inter', '/zh-tw/fonts/inter']) {
    assert(
      (await request(duplicate)).response.status === 404,
      `${duplicate} must not become a second font-detail route.`,
    )
  }
  console.log(`E2E smoke passed for ${paths.length} sitemap URLs and the 149-family catalog.`)
} finally {
  server.kill('SIGTERM')
  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ])
}
