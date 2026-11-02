// Optional developer capture tool. Never imported by the offline test gate.
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const require = createRequire(resolve(process.env.VISUAL_MODULE_ROOT || '.', 'package.json'))
const { chromium } = require('playwright')
const { PNG } = require('pngjs')
const { GIFEncoder, quantize, applyPalette } = require('gifenc')
const evidence = resolve(process.env.VISUAL_EVIDENCE_HOME || 'docs/evidence')
mkdirSync(evidence, { recursive: true })
const browser = await chromium.launch({ headless: process.env.VISUAL_HEADLESS === '1' })
const checks = []
try {
  const page = await browser.newPage()
  let network = 0
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', req => { if (req.url().startsWith('http')) network++ })
  for (const [name, width, height] of [['desktop', 1440, 900], ['phone-wide', 430, 932], ['phone', 390, 844]]) {
    await page.setViewportSize({ width, height })
    await page.goto(new URL(`file://${resolve('docs/viewer.html')}`).href)
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark theme' }).click()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      for (const element of await page.locator('button, select, summary').all()) {
        if (await element.isVisible()) assert.ok((await element.boundingBox()).height >= 44)
      }
      await page.screenshot({ path: `${evidence}/${name}-${theme}.png` })
      // Expanded artifacts must also fit at each target size.
      await page.getByText('Reveal draft expected behavior', { exact: true }).click()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      await page.getByText('Reveal draft expected behavior', { exact: true }).click()
      checks.push({ width, height, theme, overflow: false, minimumTarget: 44 })
      await page.evaluate(() => scrollTo(0, 0))
    }
    await page.keyboard.press('Control+Home')
    await page.locator('#theme').focus()
    await page.keyboard.press('Enter')
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light')
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => document.activeElement.id), 'split')
    await page.locator('#rule').selectOption('scope-lock')
    assert.match(await page.locator('#case-name').innerText(), /scope-lock/i)
    await page.locator('#split').selectOption('dev')
    assert.match(await page.locator('#case-name').innerText(), /dev/i)
    await page.locator('#list button').nth(1).click()
    assert.equal(await page.locator('#list button[aria-pressed="true"]').count(), 1)
  }
  await page.setViewportSize({ width: 1000, height: 760 })
  await page.goto(new URL(`file://${resolve('docs/viewer.html')}`).href)
  const gif = GIFEncoder()
  const frame = async () => {
    const png = PNG.sync.read(await page.screenshot())
    const palette = quantize(png.data, 256)
    gif.writeFrame(applyPalette(png.data, palette), png.width, png.height, { palette, delay: 1400 })
  }
  await frame()
  await page.locator('.desk').scrollIntoViewIfNeeded()
  await frame()
  await page.getByText('Reveal draft expected behavior', { exact: true }).click()
  await page.locator('#expected').scrollIntoViewIfNeeded()
  await frame()
  await page.locator('#rule').selectOption('scope-lock')
  await page.locator('.desk').scrollIntoViewIfNeeded()
  await frame()
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await frame()
  gif.finish()
  writeFileSync(`${evidence}/walkthrough.gif`, gif.bytes())
  assert.equal(network, 0)
  assert.deepEqual(errors, [])
  writeFileSync(`${evidence}/visual-checks.json`, JSON.stringify({ checks, networkRequests: network, consoleErrors: errors, keyboard: 'Theme via Enter, filter via Tab and select, case selection verified' }, null, 2) + '\n')
} finally { await browser.close() }
