export default defineEventHandler(async (event) => {
  const jobId = getRouterParam(event, 'jobId')

  if (!jobId) {
    throw createError({ statusCode: 400, message: 'Missing jobId' })
  }

  const job = getJob(jobId)
  if (!job) {
    throw createError({ statusCode: 404, message: 'Job not found' })
  }

  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    totalRows: job.totalRows,
    processedRows: job.processedRows,
    result: job.result,
  }
})
