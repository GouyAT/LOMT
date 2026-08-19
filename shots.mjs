/* 诡秘剧场 · 视觉验收截图脚本 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = './screenshots'
mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:5173/'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('shot:', name)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 1.5 })
page.on('console', (m) => { if (m.type() === 'error') console.log('console.error:', m.text().slice(0, 200)) })
page.on('pageerror', (e) => console.log('pageerror:', String(e).slice(0, 200)))

await page.goto(BASE)
await page.waitForTimeout(2600)
await shot(page, '01-opening-title')

// 点击 → 星空幕布分开
await page.click('#opening-title-trigger')
await page.waitForTimeout(1100)
await shot(page, '02-opening-split')

// 帷幕拉开 → 登录页
await page.waitForTimeout(2400)
await shot(page, '03-login')

// 进入游戏
await page.click('#login-new-journey')
await page.waitForTimeout(1600)
await shot(page, '04-game-pc')

// 全屏阅读
await page.click('#mode-read')
await page.waitForTimeout(900)
await shot(page, '05-game-read')

// 探索热区
await page.click('#read-mode-exit')
await page.waitForTimeout(500)
await page.click('#mode-explore')
await page.waitForTimeout(1200)
await shot(page, '06-game-explore')
await page.click('#explore-mode-exit')
await page.waitForTimeout(500)

// 地图面板
await page.click('#archive-entry-map')
await page.waitForTimeout(900)
await shot(page, '07-overlay-map')
await page.click('#overlay-close-map')
await page.waitForTimeout(400)

// 占卜面板 + 翻牌
await page.click('#archive-entry-divination')
await page.waitForTimeout(700)
await shot(page, '08-overlay-divination-back')
for (let i = 0; i < 3; i++) {
  await page.click(`#tarot-card-${i}`)
  await page.waitForTimeout(750)
}
await shot(page, '09-overlay-divination-flipped')
await page.click('#overlay-close-divination')
await page.waitForTimeout(400)

// 编年史
await page.click('#archive-entry-chronicle')
await page.waitForTimeout(700)
await shot(page, '10-overlay-chronicle')
await page.click('#overlay-close-chronicle')
await page.waitForTimeout(400)

// 设置
await page.click('#topbar-settings')
await page.waitForTimeout(700)
await shot(page, '11-overlay-settings')
await page.click('#overlay-close-settings')
await page.waitForTimeout(400)

// 移动端
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(700)
await shot(page, '12-mobile-game')

// 移动端抽屉（图鉴）
await page.click('#mobile-tab-compendium')
await page.waitForTimeout(800)
await shot(page, '13-mobile-drawer')
await page.click('#overlay-close-compendium')
await page.waitForTimeout(500)

// 移动端探索态
await page.click('#mode-explore')
await page.waitForTimeout(1000)
await shot(page, '14-mobile-explore')

await browser.close()
console.log('DONE')
