import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const testPreview = readFileSync(
  'node_modules/@fontsource-variable/inter/files/inter-latin-standard-normal.woff2',
)

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const

for (const viewport of viewports) {
  test(`FontOdyssey homepage at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.locator('[data-font-home]')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Free Font Downloads')
    await expect(page.locator('[data-font-card]')).toHaveCount(12)
    await expect(page.locator('[data-site-header] [data-header-cta]')).toHaveCount(0)

    if (viewport.name === 'desktop') {
      await expect(page.locator('.ship-main-nav')).toBeVisible()
      await expect(page.locator('[data-mobile-menu]')).toBeHidden()
      await expect(page.getByRole('link', { name: 'Commercial', exact: true })).toBeVisible()
    } else {
      const mobileMenu = page.locator('[data-mobile-menu]')
      await expect(mobileMenu).toBeVisible()
      await mobileMenu.locator('summary').click()
      await expect(mobileMenu.getByRole('link', { name: 'Commercial', exact: true })).toBeVisible()
      await expect(mobileMenu.getByRole('link', { name: 'Variable', exact: true })).toBeVisible()
    }

    const languageMenu = page.locator('[data-language-menu]')
    await languageMenu.locator('summary').click()
    await expect(page.getByRole('link', { name: 'Switch to 简体中文' })).toBeVisible()

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    )
  })

  test(`font directory at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/fonts')
    await expect(page.locator('[data-font-directory]')).toBeVisible()
    await expect(page.locator('[data-font-card]')).toHaveCount(149)
    await expect(page.locator('[data-font-directory]')).toHaveAttribute('data-hydrated', 'true')
    await page.getByLabel('Search fonts').fill('Inter')
    await expect(page.locator('[data-font-card]')).toHaveCount(2)
    await expect(page.locator('[data-font-card="inter"]')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    )
  })

  test(`font detail at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.route('https://assets.fontodyssey.com/**/preview.woff2', (route) =>
      route.fulfill({ body: testPreview, contentType: 'font/woff2' }),
    )
    await page.goto('/font/inter')
    await expect(page.locator('[data-font-detail="inter"]')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inter Font')
    await expect(page.getByText('Verified release')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Download font' })).toBeVisible()
    await expect(page.locator('[data-preview-state]')).toHaveAttribute(
      'data-preview-state',
      'ready',
    )
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    )
  })

  test(`Traditional Chinese homepage at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/zh-tw')
    await expect(page.locator('[data-font-home]')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('免費字體下載')
    await expect(page.getByText('149 已驗證', { exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    )
  })
}

// Rounds 1–2. These are app-level regressions; run after generating real preview coverage.
// The existing testPreview fixture only exercises rendering, not the production asset checksum.
test('subset previews flag missing characters and preserve an explicitly empty input', async ({
  page,
}) => {
  await page.route('https://assets.fontodyssey.com/**/preview.woff2', (route) =>
    route.fulfill({
      body: testPreview,
      contentType: 'font/woff2',
      headers: { 'Access-Control-Allow-Origin': '*' },
    }),
  )
  await page.goto('/font/inter')
  const specimen = page.locator('.fo-specimen')
  await expect(specimen).toHaveAttribute('data-preview-evidence', 'verified')
  await expect(specimen).toHaveAttribute('data-preview-state', 'ready')
  const input = specimen.getByLabel('Preview text', { exact: true })
  await input.fill('a🤖')
  await expect(specimen.locator('.fo-preview-missing')).toHaveText('🤖')
  await expect(specimen.locator('.fo-preview-notice')).toContainText('U+1F916')
  await input.fill('')
  await expect(input).toHaveValue('')
  await expect(specimen.locator('.fo-specimen-output')).toContainText('Enter text')
  await specimen.getByRole('button', { name: 'Reset sample' }).click()
  await expect(input).not.toHaveValue('')
  await expect(specimen.locator('.fo-preview-missing')).toHaveCount(0)
})

test('download anchor is visible before the specimen and moves to the real download panel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/font/inter')
  const jump = page.locator('a[href="#font-download"]')
  await expect(jump).toBeVisible()
  const bounds = await jump.boundingBox()
  expect(bounds && bounds.y < 700).toBeTruthy()
  await jump.click()
  await expect(page).toHaveURL(/#font-download$/)
  await expect(page.locator('#font-download')).toBeInViewport()
  await expect(page.locator('#font-download')).toContainText('ZIP')
  await expect(page.locator('#font-download a[href$="/inter.zip"]')).toBeVisible()
})

test('unpreviewable RFN family does not display system-font specimens', async ({ page }) => {
  await page.goto('/font/raleway')
  await expect(page.locator('.fo-specimen')).toHaveAttribute('data-preview-state', 'unavailable')
  await expect(page.locator('.fo-specimen-output')).toHaveCount(0)
  await expect(page.locator('#font-download a[href$="/raleway.zip"]')).toBeVisible()
})

test('Simplified Chinese filters are localized and an empty result has a recovery path', async ({
  page,
}) => {
  await page.goto('/zh/fonts')
  await expect(
    page.getByLabel('类别', { exact: true }).getByRole('option', { name: '手写体' }),
  ).toHaveCount(1)
  await expect(page.locator('[data-font-directory]')).toHaveAttribute('data-hydrated', 'true')
  await page.getByLabel('搜索字体', { exact: true }).fill('nothing-matches-this-font-93817')
  await expect(page.locator('.fo-directory-empty')).toBeVisible()
  await expect(page.locator('[data-font-card]')).toHaveCount(0)
  await page.locator('.fo-directory-empty').getByRole('link', { name: '清除筛选' }).click()
  await expect(page.locator('[data-font-card]')).toHaveCount(149)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})
