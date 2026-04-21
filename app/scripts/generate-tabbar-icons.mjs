/**
 * 把 src/static/tabbar/*.svg 批量渲染成 PNG。
 *
 * 背景：
 *   微信小程序的 tabBar.iconPath 文档明确 only .png / .jpg / .jpeg，
 *   直接塞 SVG 会在小程序启动阶段抛 "Wrong file format" 并阻塞模拟器启动。
 *   所以我们保留 SVG 作为"矢量源"，构建期或开发期运行本脚本生成 PNG 产物，
 *   pages.json 里 tabBar 引用 .png。改 SVG → 重跑本脚本 → 提交 PNG 一起走版本管理。
 *
 * 规格：
 *   - 输出 162x162（微信官方建议 81x81，这里 2x 保证 Retina 清晰）
 *   - ≤40KB 限制（官方上限）：纯色图标远远不会超
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tabbarDir = resolve(__dirname, '../src/static/tabbar')

const files = readdirSync(tabbarDir).filter((f) => f.endsWith('.svg'))
if (!files.length) {
  console.warn('[tabbar-icons] No SVG found in', tabbarDir)
  process.exit(0)
}

const OUTPUT_SIZE = 162

for (const file of files) {
  const svg = readFileSync(resolve(tabbarDir, file), 'utf8')
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OUTPUT_SIZE },
    background: 'rgba(0, 0, 0, 0)',
  })
  const png = resvg.render().asPng()
  const outName = basename(file, '.svg') + '.png'
  const outPath = resolve(tabbarDir, outName)
  writeFileSync(outPath, png)
  console.log(`[tabbar-icons] ${file} -> ${outName} (${png.length} bytes)`)
}

console.log('[tabbar-icons] Done.')
