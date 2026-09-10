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
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    )
  })
}
