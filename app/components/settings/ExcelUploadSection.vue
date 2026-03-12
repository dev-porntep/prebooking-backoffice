<script setup lang="ts">
import { toast } from 'vue3-toastify'

interface Props {
  title: string
  description: string
  filenamePlaceholder: string
  uploadApiPath: string
  toastUploadSuccess: string
  toastExporting: string
  toastInvalidFile: string
  toastUploadFailed: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const { isUploading, uploadedFilename: uploadedName, upload: doUpload } = useSettingsUpload(props.uploadApiPath)

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    toast.error(props.toastInvalidFile)
    input.value = ''
    return
  }
  selectedFile.value = file
}

async function upload(): Promise<void> {
  if (!selectedFile.value) return
  const ok = await doUpload(selectedFile.value)
  if (ok) {
    selectedFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
    toast.success(props.toastUploadSuccess)
  }
  else {
    toast.error(props.toastUploadFailed)
  }
}

function exportFile(): void {
  // TODO: connect to real export API
  toast.info(props.toastExporting)
}
</script>

<template>
  <section>
    <h2 class="mb-1 text-2xl font-bold text-[#030229]">
      {{ title }}
    </h2>
    <p class="mb-4 text-sm text-[#030229]/70">
      {{ description }}
    </p>

    <div
      class="flex flex-col rounded-[10px] bg-white lg:flex-row"
      style="box-shadow: 1px 17px 44px 0px rgba(3, 2, 41, 0.07);"
    >
      <!-- Left: file input + buttons -->
      <div class="flex flex-1 flex-col gap-3 p-5">
        <!-- File input row -->
        <div class="flex items-center overflow-hidden rounded-[10px] border border-[#E5E5E5] bg-[#F7F7F8]">
          <span class="flex-1 truncate px-4 py-2.5 text-sm text-[#030229]/20">
            {{ selectedFile ? selectedFile.name : filenamePlaceholder }}
          </span>
          <button
            class="shrink-0 border-l border-[#E5E5E5] bg-[#E9E5E5] px-5 py-2.5 text-sm font-normal text-[#626262] transition-colors hover:bg-gray-300"
            @click="fileInputRef?.click()"
          >
            {{ t('settings.card.browseFile') }}
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="onFileChange"
          >
        </div>

        <p class="text-xs font-semibold text-[#FF8F6B]">
          {{ t('settings.card.excelNote') }}
        </p>

        <button
          :disabled="!selectedFile || isUploading"
          class="mx-auto flex w-fit items-center gap-2 rounded-[10px] bg-[#605BFF] px-6 py-2.5 text-sm font-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          @click="upload"
        >
          <UIcon
            :name="isUploading ? 'i-lucide-loader-2' : 'i-lucide-plus'"
            class="size-4"
            :class="isUploading ? 'animate-spin' : ''"
          />
          {{ t('settings.card.upload') }}
        </button>
      </div>

      <!-- Divider: horizontal on mobile, vertical on desktop -->
      <div class="h-px bg-[#000000]/20 lg:hidden" />
      <div class="hidden w-px bg-[#000000]/40 lg:block" />

      <!-- Right: uploaded file info + export -->
      <div class="flex flex-col justify-between gap-3 p-5 lg:w-[347px] lg:shrink-0">
        <p class="truncate text-sm text-[#605BFF]">
          {{ uploadedName ? `${t('settings.card.filePrefix')} ${uploadedName}` : t('settings.card.noFileUploaded') }}
        </p>
        <div class="flex justify-center">
          <button
            :disabled="!uploadedName"
            class="rounded-[10px] bg-[#F29339] px-5 py-2.5 text-sm font-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            @click="exportFile"
          >
            {{ t('settings.card.exportXlsx') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
