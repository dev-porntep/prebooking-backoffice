export default defineEventHandler(async (event) => {
  const protectedPaths = ['/api/prebooking', '/api/import', '/api/export']
  const url = getRequestURL(event)

  if (!protectedPaths.some(path => url.pathname.startsWith(path))) return

  // TODO: เปลี่ยนเป็น getUserSession(event) ตอนต่อ SSO จริง
  const session = { user: { id: '1', name: 'Admin' }, accessToken: 'mock-token' }

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  event.context.auth = {
    user: session.user,
    token: session.accessToken,
  }
})
