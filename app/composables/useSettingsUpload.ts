import type { SettingsUploadResponse } from '~/types/settings'

export const useSettingsUpload = (uploadApiPath: string) => {
  const isUploading = ref(false)
  const uploadedFilename = ref<string | null>(null)
  const error = ref<string | null>(null)

  async function upload(file: File): Promise<boolean> {
    isUploading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      await $fetch<SettingsUploadResponse>(uploadApiPath, { method: 'POST', body: formData })
      uploadedFilename.value = file.name
      return true
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Upload failed'
      return false
    }
    finally {
      isUploading.value = false
    }
  }

  function reset(): void {
    uploadedFilename.value = null
    error.value = null
  }

  return { isUploading, uploadedFilename, error, upload, reset }
}
