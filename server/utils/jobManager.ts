interface JobStatus {
  id: string
  type: 'import' | 'export'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  totalRows: number
  processedRows: number
  result?: { success: number; failed: number; errors: unknown[] }
  createdAt: Date
}

const jobs = new Map<string, JobStatus>()

export const createJob = (type: 'import' | 'export'): JobStatus => {
  const id = crypto.randomUUID()
  const job: JobStatus = {
    id,
    type,
    status: 'pending',
    progress: 0,
    totalRows: 0,
    processedRows: 0,
    createdAt: new Date(),
  }
  jobs.set(id, job)
  return job
}

export const updateJobProgress = (id: string, processedRows: number, totalRows: number) => {
  const job = jobs.get(id)
  if (!job) return
  job.processedRows = processedRows
  job.totalRows = totalRows
  job.progress = totalRows > 0 ? Math.round((processedRows / totalRows) * 100) : 0
  job.status = 'processing'
}

export const getJob = (id: string) => jobs.get(id)

export const completeJob = (id: string, result: JobStatus['result']) => {
  const job = jobs.get(id)
  if (!job) return
  job.status = 'completed'
  job.progress = 100
  job.result = result
}

export const failJob = (id: string, error: string) => {
  const job = jobs.get(id)
  if (!job) return
  job.status = 'failed'
  job.result = { success: 0, failed: 0, errors: [error] }
}
