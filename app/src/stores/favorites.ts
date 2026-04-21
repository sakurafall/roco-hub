import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import type { Favorite } from '@/types/user'

const KEY = 'favorites.list'

/**
 * 收藏 store · 骨架阶段先用本地存储承载，
 * 接入服务端后改为：远端为权威 + 本地做乐观更新。
 */
export const useFavoritesStore = defineStore('favorites', () => {
  const list = ref<Favorite[]>(storage.get<Favorite[]>(KEY, []) ?? [])

  function isFavorited(targetType: Favorite['targetType'], targetId: string): boolean {
    return list.value.some((f) => f.targetType === targetType && f.targetId === targetId)
  }

  function add(fav: Favorite) {
    if (!isFavorited(fav.targetType, fav.targetId)) {
      list.value = [fav, ...list.value]
      storage.set(KEY, list.value)
    }
  }

  function removeById(id: string) {
    list.value = list.value.filter((f) => f.id !== id)
    storage.set(KEY, list.value)
  }

  return { list, isFavorited, add, removeById }
})
