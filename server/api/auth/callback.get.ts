export default defineEventHandler(async () => {
  // TODO: แลก auth code เป็น token จริง
  return { user: { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' } }
})
