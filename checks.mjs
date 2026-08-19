/* 诡秘剧场 · DOM 级自动化验收 */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)) })
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 160)))
const fail = (s) => { console.log('  FAIL:', s) }

await page.goto('http://localhost:5173/')
await page.waitForTimeout(2600)

// 1. 开场标题元素
for (const sel of ['#opening-title-trigger']) {
  if (!(await page.locator(sel).count())) fail(`missing ${sel}`)
}

// 2. 字体加载
const fonts = await page.evaluate(async () => {
  await document.fonts.ready
  return ['Cinzel Decorative', 'Cinzel', 'EB Garamond', 'Noto Serif SC'].map((f) => `${f}: ${document.fonts.check(`16px "${f}"`) ? 'OK' : 'MISSING'}`)
})
console.log('fonts:', fonts.join(' | '))

// 3. 进入游戏
await page.click('#opening-title-trigger')
await page.waitForTimeout(3800)
await page.click('#login-new-journey')
await page.waitForTimeout(1600)

// 4. 溢出检测（横向滚动检查所有元素）
const overflow = await page.evaluate(() => {
  const bad = []
  document.querySelectorAll('*').forEach((el) => {
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
      const cs = getComputedStyle(el)
      if (cs.overflowX === 'visible') {
        const r = el.getBoundingClientRect()
        if (r.width > 0) bad.push(`${el.tagName}.${[...el.classList].slice(0, 2).join('.')}#${el.id || ''} sw=${el.scrollWidth} cw=${el.clientWidth}`)
      }
    }
  })
  return bad.slice(0, 12)
})
overflow.length ? overflow.forEach((o) => fail('overflow ' + o)) : console.log('overflow: clean')

// 5. 主界面元素齐全
for (const sel of ['#status-panel', '#narrative-stage', '#archive-panel', '#chat-input-form', '#message-block', '#thinking-toggle']) {
  if (!(await page.locator(sel).count())) fail(`missing ${sel}`)
}

// 6. 各面板逐一打开验证内容
const overlays = [
  ['#archive-entry-map', '#overlay-close-map'],
  ['#archive-entry-compendium', '#overlay-close-compendium'],
  ['#archive-entry-chronicle', '#overlay-close-chronicle'],
  ['#archive-entry-newspaper', '#overlay-close-newspaper'],
  ['#archive-entry-relation', '#overlay-close-relation'],
  ['#topbar-settings', '#overlay-close-settings'],
  ['#topbar-save', '#overlay-close-save'],
  ['#archive-entry-battle', '#overlay-close-battle'],
]
for (const [openSel, closeSel] of overlays) {
  await page.click(openSel)
  await page.waitForTimeout(650)
  const panelBox = await page.locator('[role="dialog"]').last().boundingBox()
  if (!panelBox) { fail(`panel ${openSel} no dialog box`); continue }
  const inView = panelBox.x >= -2 && panelBox.x + panelBox.width <= 1602 && panelBox.y >= -2 && panelBox.y + panelBox.height <= 952
  if (!inView) fail(`panel ${openSel} outside viewport: ${JSON.stringify(panelBox)}`)
  // 面板内文字溢出
  const innerOverflow = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    if (!d) return []
    const bad = []
    d.querySelectorAll('*').forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0) {
        const cs = getComputedStyle(el)
        if (cs.overflowX === 'visible') bad.push(`${el.tagName}.${[...el.classList].slice(0, 2).join('.')} sw=${el.scrollWidth} cw=${el.clientWidth}`)
      }
    })
    return bad.slice(0, 6)
  })
  innerOverflow.length ? innerOverflow.forEach((o) => fail(`panel ${openSel} inner overflow ${o}`)) : console.log(`panel ${openSel}: ok`)
  await page.click(closeSel)
  await page.waitForTimeout(400)
}

// 7. 占卜翻牌
await page.click('#archive-entry-divination')
await page.waitForTimeout(600)
for (let i = 0; i < 3; i++) { await page.click(`#tarot-card-${i}`); await page.waitForTimeout(700) }
const flippedCount = await page.evaluate(() => document.querySelectorAll('[data-flipped="true"]').length)
if (flippedCount !== 3) fail(`tarot flipped=${flippedCount}`)
await page.click('#overlay-close-divination')
await page.waitForTimeout(400)

// 8. Toast 系统
await page.fill('#chat-input', '观察接待室的环境')
await page.click('#chat-send')
await page.waitForTimeout(600)
const toastCount = await page.evaluate(() => document.querySelectorAll('[role="region"] .fixed, [role="status"]').length)
if (toastCount === 0) fail('no toast appeared')
await page.waitForTimeout(1000)

// 9. 移动端
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(800)
const tabBar = await page.locator('#mobile-tab-narrative').boundingBox()
if (!tabBar || tabBar.y + tabBar.height > 846) fail('mobile tab bar off-screen')
for (const id of ['#mobile-tab-map', '#mobile-tab-compendium', '#mobile-tab-inventory', '#mobile-tab-settings']) {
  const b = await page.locator(id).boundingBox()
  if (!b) fail(`missing ${id}`)
}
// 移动端抽屉（bottom sheet：面板底边应贴视口底）
await page.click('#mobile-tab-map')
await page.waitForTimeout(800)
const drawer = await page.locator('[role="dialog"]').last().boundingBox()
const drawerBottom = drawer ? drawer.y + drawer.height : -1
if (!drawer || Math.abs(drawerBottom - 844) > 6) fail(`mobile drawer not bottom-sheet: ${JSON.stringify(drawer)}`)
await page.click('#overlay-close-map')
await page.waitForTimeout(400)

console.log('\nerrors:', errors.length ? errors.join('\n') : 'none')
await browser.close()
console.log('CHECKS DONE')
