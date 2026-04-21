import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { uuid } from '@/utils/env'
import type { AuthTokens, User } from '@/types/user'

const TOKEN_KEY = 'user.tokens'
const DEVICE_KEY = 'user.deviceId'
const USER_KEY = 'user.profile'

export const useUserStore = defineStore('user', () => {
  const tokens = ref<AuthTokens | null>(storage.get<AuthTokens | null>(TOKEN_KEY, null) ?? null)
  const profile = ref<User | null>(storage.get<User | null>(USER_KEY, null) ?? null)

  // deviceId 一旦生成永不变，作为 H5 端匿名身份
  const initialDeviceId = storage.get<string>(DEVICE_KEY)
  if (!initialDeviceId) {
    storage.set(DEVICE_KEY, uuid())
  }
  const deviceId = ref<string>(storage.get<string>(DEVICE_KEY) ?? uuid())

  function setTokens(next: AuthTokens | null) {
    tokens.value = next
    if (next) storage.set(TOKEN_KEY, next)
    else storage.remove(TOKEN_KEY)
  }

  function setProfile(next: User | null) {
    profile.value = next
    if (next) storage.set(USER_KEY, next)
    else storage.remove(USER_KEY)
  }

  function clear() {
    setTokens(null)
    setProfile(null)
  }

  return {
    tokens,
    profile,
    deviceId,
    accessToken: () => tokens.value?.accessToken ?? '',
    refreshToken: () => tokens.value?.refreshToken ?? '',
    setTokens,
    setProfile,
    clear,
  }
})
