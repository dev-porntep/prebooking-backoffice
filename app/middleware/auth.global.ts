export default defineNuxtRouteMiddleware((to) => {
  const { public: { authEnabled } } = useRuntimeConfig()

  // Skip auth on static builds (e.g. GitHub Pages preview)
  if (!authEnabled) return

  const { loggedIn } = useUserSession()

  if (to.path === '/login') return

  // if (!loggedIn.value) {
  //   return navigateTo('/login')
  // }
})
