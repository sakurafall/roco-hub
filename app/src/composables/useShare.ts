// composables/useShare.ts
import shareHome from '@/static/share/share-home.png'

interface UseShareOptions {
  title?: string
  path?: string
  imageUrl?: string
}


export function useShare(options?: UseShareOptions) {
  const defaultTitle = '洛克助手 | 精灵图鉴&克制查询'
  const defaultPath = 'pages/home/index'
  const defaultImageUrl = shareHome

  const getShareAppMessage = () => {
    return {
      title: options?.title ?? defaultTitle,
      path: options?.path ?? defaultPath,
      imageUrl: options?.imageUrl ?? defaultImageUrl
    }
  }

  const getShareTimeline = () => {
    return {
      title: `${options?.title ?? defaultTitle}，训练师必备工具`,
      query: 'from=timeline',
      imageUrl: options?.imageUrl ?? defaultImageUrl
    }
  }

  return {
    getShareAppMessage,
    getShareTimeline
  }
}