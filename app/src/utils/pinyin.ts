// 说明：
// pinyin-pro 内置一份 7000+ 条的多音字字典，mp-weixin 编译后会把
// 汉字作为未加引号的对象 key 输出到 common/vendor.js，小程序 JS 解析器
// 不接受这种裸标识符，导致 "Unexpected token, expected ','" 报错并直接
// 阻塞整个小程序启动。
//
// 兼容策略：
//   - H5：正常使用 pinyin-pro，保留完整拼音 / 首字母搜索能力。
//   - mp-weixin：走降级，toPinyin/toPinyinInitial 都返回原文小写。
//     精灵名本身较短（多为 2~4 字），中文子串 + 编号 + slug 匹配足够覆盖
//     绝大多数搜索场景；拼音 / 首字母搜索作为 H5 的增强能力。
//
// 如后续需要在小程序也支持拼音搜索，建议在离线脚本里预生成
// spirits 的拼音索引（name -> pinyin / initial），运行时直接查表，
// 避免把大字典打进 bundle。

// #ifdef H5
import { pinyin } from 'pinyin-pro'
// #endif

/**
 * 把中文转成不带音调的连续拼音字符串，便于本地搜索时做模糊匹配。
 * 例：'迪莫' -> 'dimo'
 * mp-weixin 平台降级：直接返回原文小写。
 */
export function toPinyin(text: string): string {
  if (!text) return ''
  // #ifdef H5
  return pinyin(text, { toneType: 'none', type: 'array' }).join('').toLowerCase()
  // #endif
  // #ifndef H5
  return text.toLowerCase()
  // #endif
}

/**
 * 返回首字母拼接，例：'迪莫' -> 'dm'
 * mp-weixin 平台降级：直接返回原文小写。
 */
export function toPinyinInitial(text: string): string {
  if (!text) return ''
  // #ifdef H5
  return pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' })
    .join('')
    .toLowerCase()
  // #endif
  // #ifndef H5
  return text.toLowerCase()
  // #endif
}
