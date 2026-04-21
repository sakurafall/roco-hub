import { useDataStore } from '@/stores/data'

/**
 * 数据同步占位：MVP-A 启动时拉 /v1/meta/data-version，
 * 对比本地版本号决定是否拉取增量；骨架阶段直接返回本地版本。
 */
export function useDataSync() {
  const data = useDataStore()

  async function check(): Promise<{ updated: boolean; version: string }> {
    return { updated: false, version: data.version }
  }

  return { check }
}
