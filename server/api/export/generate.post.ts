export default defineEventHandler(async (event) => {
  const _body = await readBody(event)

  // TODO: เปลี่ยนเป็น streaming export จริง
  const job = createJob('export')

  return {
    jobId: job.id,
    status: 'processing',
  }
})
