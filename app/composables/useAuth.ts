import type { AuthSession, SSOUser } from '~/types/auth'

export const useAuth = () => {
  const session = ref<AuthSession | null>(null)
  const isLoading = ref(false)

  // Mock checking session
  const checkSession = async () => {
    isLoading.value = true
    try {
      // TODO: Replace with real /api/auth/session call
      session.value = {
        user: { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' },
        accessToken: 'mock-token',
        expiresAt: Date.now() + 86400000
      }
    } catch {
      session.value = null
    } finally {
      isLoading.value = false
    }
  }

  const loginWithSSO = async () => {
    await navigateTo('/api/auth/sso', { external: true })
  }

  const logout = async () => {
    isLoading.value = true
    try {
      // TODO: Replace with real /api/auth/logout call
      session.value = null
      await navigateTo('/login')
    } finally {
      isLoading.value = false
    }
  }

  const isAuthenticated = computed(() => !!session.value && session.value.expiresAt > Date.now())
  const user = computed<SSOUser | null>(() => session.value?.user || null)

  return {
    session,
    isLoading,
    isAuthenticated,
    user,
    checkSession,
    loginWithSSO,
    logout
  }
}
