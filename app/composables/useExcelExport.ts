import type { ExportFilter, ExportJob } from '~/types/excel'

export const useExcelExport = () => {
  const isExporting = ref(false)
  const currentJob = ref<ExportJob | null>(null)
  const error = ref<string | null>(null)

  const startExport = async (filter: ExportFilter) => {
    isExporting.value = true
    error.value = null

    try {
      const response = await $fetch<{ jobId: string }>('/api/export/generate', {
        method: 'POST',
        body: filter
      })

      currentJob.value = {
        id: response.jobId,
        status: 'processing',
        progress: 0,
        filters: filter,
        totalRows: 0,
        createdAt: new Date().toISOString()
      }

      pollStatus()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to start export'
      isExporting.value = false
    }
  }

  const pollStatus = async () => {
    if (!currentJob.value) return

    try {
      const status = await $fetch<ExportJob>(`/api/export/status/${currentJob.value.id}`)
      currentJob.value = status

      if (status.status === 'processing' || status.status === 'pending') {
        setTimeout(pollStatus, 2000)
      } else {
        isExporting.value = false
        if (status.status === 'completed' && status.downloadUrl) {
          downloadFile(status.downloadUrl)
        }
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to get export status'
      isExporting.value = false
    }
  }

  const downloadFile = (url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = ''
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    isExporting,
    currentJob,
    error,
    startExport
  }
}
