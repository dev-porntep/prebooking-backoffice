export default defineEventHandler(event =>
  sendRedirect(event, '/auth/google')
)
