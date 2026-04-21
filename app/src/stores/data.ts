import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'

const VERSION_KEY = 'data.globalVersion'

/**
 * 数据版本与全局元数据的存储，第一阶段只承担"显示当前版本号"的职责。
 * 真实的 CDN 同步逻辑在 useDataSync 中（MVP-A 后续完善）。
 */
export const useDataStore = defineStore('data', () => {
  const version = ref<string>(storage.get<string>(VERSION_KEY, '0.0.0-skeleton') ?? '0.0.0-skeleton')

  function setVersion(v: string) {
    version.value = v
    storage.set(VERSION_KEY, v)
  }

  return { version, setVersion }
})
