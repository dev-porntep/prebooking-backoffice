export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // TODO: เปลี่ยนเป็น backendFetch ตอนต่อ backend จริง
  // return await backendFetch(event, '/prebookings', { method: 'POST', body })

  return { success: true, message: 'Created', data: body }
})
