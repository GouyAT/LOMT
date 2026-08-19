import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } })
await page.goto('http://localhost:5173/')
await page.waitForTimeout(2600)
await page.click('#opening-title-trigger')
await page.waitForTimeout(3800)
await page.click('#login-new-journey')
await page.waitForTimeout(1500)
await page.click('#mode-explore')
await page.waitForTimeout(1200)

const box = await page.locator('#explore-mode-exit').boundingBox()
console.log('explore-exit bbox:', JSON.stringify(box))
const vp = page.viewportSize()
console.log('viewport:', JSON.stringify(vp))
const html = await page.evaluate(() => {
  const el = document.getElementById('explore-mode-exit')
  const cs = getComputedStyle(el)
  let p = el.parentElement
  const chain = []
  while (p && chain.length < 6) {
    chain.push(`${p.tagName}.${[...p.classList].slice(0, 3).join('.')} pos=${getComputedStyle(p).position} transform=${getComputedStyle(p).transform.slice(0, 40)}`)
    p = p.parentElement
  }
  return { rect: el.getBoundingClientRect().toJSON(), position: cs.position, chain }
})
console.log(JSON.stringify(html, null, 2))
await browser.close()
