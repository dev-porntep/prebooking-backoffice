export default defineEventHandler(async () => {
  // TODO: Redirect ไป SSO provider จริง
  return sendRedirect(useEvent(), '/login?error=sso_not_configured')
})
