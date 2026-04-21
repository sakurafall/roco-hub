import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'

const KEY = 'history.spirits'
const MAX_LEN = 50

export interface HistoryItem {
  spiritId: string
  spiritName: string
  visitedAt: number
}

/**
 * 浏览历史 · 仅在本地维护，按 visitedAt 倒序，最多 MAX_LEN 条。
 */
export const useHistoryStore = defineStore('history', () => {
  const list = ref<HistoryItem[]>(storage.get<HistoryItem[]>(KEY, []) ?? [])

  function push(item: HistoryItem) {
    const filtered = list.value.filter((i) => i.spiritId !== item.spiritId)
    const next = [item, ...filtered].slice(0, MAX_LEN)
    list.value = next
    storage.set(KEY, next)
  }

  function clear() {
    list.value = []
    storage.set(KEY, [])
  }

  return { list, push, clear }
})
