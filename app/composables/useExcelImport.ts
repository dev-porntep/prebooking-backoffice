import { storeToRefs } from 'pinia'
import { useImportStore } from '~/stores/importStore'

export const useExcelImport = () => {
  const store = useImportStore()
  const { 
    currentJobId, 
    jobStatus, 
    previewResult, 
    isUploading, 
    isProcessing, 
    error 
  } = storeToRefs(store)

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      await store.uploadFile(file)
    }
  }

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer?.files?.[0]
    if (file) {
      await store.uploadFile(file)
    }
  }

  const startImport = async () => {
    await store.processImport()
  }

  const resetImport = () => {
    store.reset()
  }

  return {
    currentJobId,
    jobStatus,
    previewResult,
    isUploading,
    isProcessing,
    error,
    handleFileSelect,
    handleDrop,
    startImport,
    resetImport
  }
}
