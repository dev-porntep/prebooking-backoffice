import { defineStore } from 'pinia'
import type { ImportJobStatus, ImportPreviewResult } from '~/types/excel'

export const useImportStore = defineStore('import', () => {
  const currentJobId = ref<string | null>(null)
  const jobStatus = ref<ImportJobStatus | null>(null)
  const previewResult = ref<ImportPreviewResult | null>(null)
  const isUploading = ref(false)
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  async function uploadFile(file: File): Promise<{ jobId: string, preview: ImportPreviewResult } | null> {
    isUploading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await $fetch<{ jobId: string, preview: ImportPreviewResult }>('/api/import/upload', {
        method: 'POST',
        body: { filename: file.name, size: file.size },
      })

      currentJobId.value = response.jobId
      previewResult.value = response.preview

      return response
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Upload failed'
      return null
    }
    finally {
      isUploading.value = false
    }
  }

  async function processImport(): Promise<boolean> {
    if (!currentJobId.value) return false

    isProcessing.value = true
    error.value = null

    try {
      await $fetch('/api/import/process', {
        method: 'POST',
        body: { jobId: currentJobId.value },
      })

      pollStatus()
      return true
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Process failed'
      isProcessing.value = false
      return false
    }
  }

  async function pollStatus(): Promise<void> {
    if (!currentJobId.value) return

    try {
      const status = await $fetch<ImportJobStatus>(`/api/import/status/${currentJobId.value}`)
      jobStatus.value = status

      if (status.status === 'processing' || status.status === 'pending') {
        setTimeout(pollStatus, 2000)
      }
      else {
        isProcessing.value = false
      }
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to get status'
      isProcessing.value = false
    }
  }

  function reset(): void {
    currentJobId.value = null
    jobStatus.value = null
    previewResult.value = null
    isUploading.value = false
    isProcessing.value = false
    error.value = null
  }

  return {
    currentJobId,
    jobStatus,
    previewResult,
    isUploading,
    isProcessing,
    error,
    uploadFile,
    processImport,
    pollStatus,
    reset,
  }
})
