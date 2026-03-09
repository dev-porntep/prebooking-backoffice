import { defineStore } from 'pinia'
import type { ImportJobStatus, ImportPreviewResult } from '~/types/excel'

export const useImportStore = defineStore('import', {
  state: () => ({
    currentJobId: null as string | null,
    jobStatus: null as ImportJobStatus | null,
    previewResult: null as ImportPreviewResult | null,
    isUploading: false,
    isProcessing: false,
    error: null as string | null,
  }),

  actions: {
    async uploadFile(file: File) {
      this.isUploading = true
      this.error = null
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // In real app, we'd send multipart form data
        // const response = await $fetch('/api/import/upload', { method: 'POST', body: formData })
        
        // Mock response
        const response = await $fetch<{ jobId: string, preview: ImportPreviewResult }>('/api/import/upload', {
          method: 'POST',
          body: { filename: file.name, size: file.size }
        })
        
        this.currentJobId = response.jobId
        this.previewResult = response.preview
      } catch (err: any) {
        this.error = err.message || 'Upload failed'
      } finally {
        this.isUploading = false
      }
    },

    async processImport() {
      if (!this.currentJobId) return
      
      this.isProcessing = true
      this.error = null
      
      try {
        await $fetch('/api/import/process', {
          method: 'POST',
          body: { jobId: this.currentJobId }
        })
        
        // Start polling status
        this.pollStatus()
      } catch (err: any) {
        this.error = err.message || 'Process failed'
        this.isProcessing = false
      }
    },

    async pollStatus() {
      if (!this.currentJobId) return
      
      const checkStatus = async () => {
        try {
          const status = await $fetch<ImportJobStatus>(`/api/import/status/${this.currentJobId}`)
          this.jobStatus = status
          
          if (status.status === 'processing' || status.status === 'pending') {
            setTimeout(checkStatus, 2000) // Poll every 2s
          } else {
            this.isProcessing = false
          }
        } catch (err: any) {
          this.error = err.message || 'Failed to get status'
          this.isProcessing = false
        }
      }
      
      checkStatus()
    },

    reset() {
      this.currentJobId = null
      this.jobStatus = null
      this.previewResult = null
      this.isUploading = false
      this.isProcessing = false
      this.error = null
    }
  }
})
