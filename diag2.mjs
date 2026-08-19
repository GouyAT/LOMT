import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } })
await page.goto('http://localhost:5173/')
await page.waitForTimeout(2600)
await page.click('#opening-title-trigger')
await page.waitForTimeout(3800)
await page.click('#login-new-journey')
await page.waitForTimeout(1500)
await page.click('#archive-entry-map')
await page.waitForTimeout(900)

const info = await page.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')].pop()
  if (!d) return { error: 'no dialog' }
  const cs = getComputedStyle(d)
  return {
    cls: d.className,
    position: cs.position,
    top: cs.top,
    right: cs.right,
    bottom: cs.bottom,
    left: cs.left,
    maxHeight: cs.maxHeight,
    width: cs.width,
    mdApplied: (() => {
      const m = window.matchMedia('(min-width: 768px)')
      return { matches: m.matches }
    })(),
  }
})
console.log(JSON.stringify(info, null, 2))

// 检查 CSS 里是否包含 md\:right-3 规则
const cssCheck = await page.evaluate(async () => {
  const found = { 'md\\:right-3': false, 'md\\:inset-y-3': false }
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText?.includes('md\\:right-3')) found['md\\:right-3'] = true
        if (rule.selectorText?.includes('md\\:inset-y-3')) found['md\\:inset-y-3'] = true
      }
    } catch {}
  }
  return found
})
console.log('css rules:', JSON.stringify(cssCheck))
await browser.close()
