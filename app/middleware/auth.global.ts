export default defineNuxtRouteMiddleware(() => {
  const { public: { authEnabled } } = useRuntimeConfig()

  // Skip auth on static builds (e.g. GitHub Pages preview)
  if (!authEnabled) return

  // const { loggedIn } = useUserSession()
  // if (!loggedIn.value) {
  //   return navigateTo('/auth/google', { external: true })
  // }
})
