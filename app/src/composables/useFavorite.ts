import { useFavoritesStore } from '@/stores/favorites'
import type { Favorite } from '@/types/user'
import { uuid } from '@/utils/env'

/**
 * 收藏切换。骨架阶段仅本地存储，
 * 接入后端后改为：先发 favoriteService.add/remove → 成功后再写本地。
 */
export function useFavorite() {
  const store = useFavoritesStore()

  function isFavorited(targetType: Favorite['targetType'], targetId: string) {
    return store.isFavorited(targetType, targetId)
  }

  function toggle(targetType: Favorite['targetType'], targetId: string) {
    if (store.isFavorited(targetType, targetId)) {
      const found = store.list.find((f) => f.targetType === targetType && f.targetId === targetId)
      if (found) store.removeById(found.id)
    } else {
      store.add({
        id: uuid(),
        targetType,
        targetId,
        createdAt: new Date().toISOString(),
      })
    }
  }

  return { isFavorited, toggle, list: store.list }
}
