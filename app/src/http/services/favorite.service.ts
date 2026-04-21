import { request } from '../request'
import { Endpoints } from '../endpoints'
import type { Paginated, PageQuery } from '@/types/api'
import type { Favorite } from '@/types/user'

export interface FavoriteListQuery extends PageQuery {
  targetType?: Favorite['targetType']
}

export interface AddFavoritePayload {
  targetType: Favorite['targetType']
  targetId: string
}

export const favoriteService = {
  list(params: FavoriteListQuery = {}): Promise<Paginated<Favorite>> {
    return request.get<Paginated<Favorite>>(Endpoints.favorites, { params })
  },

  add(payload: AddFavoritePayload): Promise<Favorite> {
    return request.post<Favorite>(Endpoints.favorites, payload)
  },

  remove(id: string): Promise<{ deleted: true }> {
    return request.delete<{ deleted: true }>(Endpoints.favoriteDelete(id))
  },

  batchDelete(ids: string[]): Promise<{ deletedCount: number }> {
    return request.post<{ deletedCount: number }>(Endpoints.favoritesBatchDelete, { ids })
  },
}
