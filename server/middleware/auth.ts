export default defineEventHandler(async (event) => {
  const protectedPaths = ['/api/prebooking', '/api/import', '/api/export', '/api/settings']
  const url = getRequestURL(event)

  if (!protectedPaths.some(path => url.pathname.startsWith(path))) return

  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  event.context.auth = {
    user: session.user,
    token: session.accessToken as string | undefined,
  }
})
