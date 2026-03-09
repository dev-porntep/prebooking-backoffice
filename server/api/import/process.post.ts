export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const jobId = body?.jobId as string

  if (!jobId) {
    throw createError({ statusCode: 400, message: 'Missing jobId' })
  }

  const job = getJob(jobId)
  if (!job) {
    throw createError({ statusCode: 404, message: 'Job not found' })
  }

  // TODO: เปลี่ยนเป็น chunked processing จริง
  // Mock: simulate processing
  job.totalRows = 150
  job.status = 'processing'

  setTimeout(() => {
    completeJob(jobId, { success: 147, failed: 3, errors: [] })
  }, 3000)

  return { jobId, status: 'processing' }
})
