export default defineEventHandler(async (_event) => {
  // TODO: เปลี่ยนเป็น จัดการ multipart upload + stream parse
  const job = createJob('import')

  return {
    jobId: job.id,
    preview: {
      totalRows: 150,
      headers: ['customer_name', 'phone_number', 'email', 'device_model', 'device_color', 'storage', 'quantity', 'preferred_branch', 'prebooking_date', 'deposit_amount', 'notes'],
      sampleRows: [],
      errors: [],
    },
  }
})
