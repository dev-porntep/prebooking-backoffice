export default defineNuxtRouteMiddleware((to) => {
  // TODO: เปลี่ยนเป็น useUserSession() ตอนต่อ SSO จริง
  const isAuthenticated = true // mock

  if (to.path === '/login') return

  if (!isAuthenticated) {
    return navigateTo('/login')
  }
})
