<script setup lang="ts">
import { toast } from 'vue3-toastify'

definePageMeta({ title: 'Settings' })
useHead({ title: 'Settings – Pre Booking' })

// ── Quota section state ──────────────────────────────
const quotaFile = ref<File | null>(null)
const quotaUploadedName = ref<string | null>(null)
const quotaFileInput = ref<HTMLInputElement | null>(null)
const isQuotaUploading = ref(false)

// ── Pickup Date section state ────────────────────────
const dateFile = ref<File | null>(null)
const dateUploadedName = ref<string | null>(null)
const dateFileInput = ref<HTMLInputElement | null>(null)
const isDateUploading = ref(false)

// ── Helpers ──────────────────────────────────────────
const isValidExcel = (file: File) => /\.(xlsx|xls)$/i.test(file.name)

function onQuotaFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!isValidExcel(file)) {
    toast.error('กรุณาเลือกไฟล์ excel (.xlsx) เท่านั้น')
    input.value = ''
    return
  }
  quotaFile.value = file
}

function onDateFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!isValidExcel(file)) {
    toast.error('กรุณาเลือกไฟล์ excel (.xlsx) เท่านั้น')
    input.value = ''
    return
  }
  dateFile.value = file
}

async function uploadQuota() {
  if (!quotaFile.value) return
  isQuotaUploading.value = true
  try {
    // TODO: connect to real API /api/import/quota
    await new Promise(r => setTimeout(r, 800))
    quotaUploadedName.value = quotaFile.value.name
    quotaFile.value = null
    if (quotaFileInput.value) quotaFileInput.value.value = ''
    toast.success('อัปโหลด Quota สำเร็จ')
  }
  catch {
    toast.error('อัปโหลดล้มเหลว กรุณาลองใหม่')
  }
  finally {
    isQuotaUploading.value = false
  }
}

async function uploadDate() {
  if (!dateFile.value) return
  isDateUploading.value = true
  try {
    // TODO: connect to real API /api/import/dates
    await new Promise(r => setTimeout(r, 800))
    dateUploadedName.value = dateFile.value.name
    dateFile.value = null
    if (dateFileInput.value) dateFileInput.value.value = ''
    toast.success('อัปโหลด Pickup date สำเร็จ')
  }
  catch {
    toast.error('อัปโหลดล้มเหลว กรุณาลองใหม่')
  }
  finally {
    isDateUploading.value = false
  }
}

function exportQuota() {
  // TODO: connect to real export API
  toast.info('กำลัง Export Quota...')
}

function exportDate() {
  // TODO: connect to real export API
  toast.info('กำลัง Export Pickup date...')
}
</script>

<template>
  <div class="space-y-10">
    <!-- ── Update Quota ─────────────────────────────────── -->
    <section>
      <h1 class="mb-1 text-2xl font-bold text-[#030229]">Update Quota</h1>
      <p class="mb-1 text-sm text-[#030229]/70">
        Upload file สำหรับ update Quota &nbsp;(สามารถ update ทับได้)
      </p>
      <p class="mb-4 text-xs font-semibold text-[#FF8F6B]">excel file (.xlsx) เท่านั้น</p>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
        <!-- Left: file input + buttons -->
        <div
          class="relative flex flex-col gap-3 rounded-[10px] bg-white p-5"
          style="box-shadow: 1px 17px 44px 0px rgba(3, 2, 41, 0.07); flex: 1;"
        >
          <!-- File input row -->
          <div class="flex items-center gap-3">
            <div class="flex flex-1 items-center rounded-[10px] border border-[#E5E5E5] bg-[#F7F7F8] px-4 py-2.5">
              <span class="flex-1 truncate text-sm text-[#030229]/20">
                {{ quotaFile ? quotaFile.name : 'File name - xxxxx_DD_MM_YYYY.xlsx' }}
              </span>
            </div>
            <button
              class="shrink-0 rounded-[10px] bg-[#E9E5E5] px-5 py-2.5 text-sm font-normal text-[#626262] transition-colors hover:bg-gray-300"
              @click="quotaFileInput?.click()"
            >
              Browse file
            </button>
            <input
              ref="quotaFileInput"
              type="file"
              accept=".xlsx,.xls"
              class="hidden"
              @change="onQuotaFileChange"
            >
          </div>

          <!-- Upload button -->
          <button
            :disabled="!quotaFile || isQuotaUploading"
            class="flex w-fit items-center gap-2 rounded-[10px] bg-[#605BFF] px-6 py-2.5 text-sm font-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            @click="uploadQuota"
          >
            <UIcon
              :name="isQuotaUploading ? 'i-lucide-loader-2' : 'i-lucide-plus'"
              class="size-4"
              :class="isQuotaUploading ? 'animate-spin' : ''"
            />
            Upload
          </button>

          <!-- Separator (desktop) -->
          <div class="absolute right-0 top-0 hidden h-full w-px bg-[#000000]/40 lg:block" />
        </div>

        <!-- Right: uploaded file info + export -->
        <div
          class="flex min-w-0 flex-col gap-3 rounded-[10px] bg-white p-5 lg:w-[347px] lg:shrink-0"
          style="box-shadow: 1px 17px 44px 0px rgba(3, 2, 41, 0.07);"
        >
          <p class="truncate text-sm text-[#605BFF]">
            {{ quotaUploadedName ? `File :: ${quotaUploadedName}` : 'ยังไม่มีไฟล์ที่อัปโหลด' }}
          </p>
          <div class="flex justify-end">
            <button
              :disabled="!quotaUploadedName"
              class="rounded-[10px] bg-[#F29339] px-5 py-2.5 text-sm font-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              @click="exportQuota"
            >
              Export .xlsx
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Pickup date ──────────────────────────────────── -->
    <section>
      <h2 class="mb-1 text-2xl font-bold text-[#030229]">Pickup date</h2>
      <p class="mb-1 text-sm text-[#030229]/70">
        Upload file สำหรับ setup ตารางวันที่จองและวันที่รับสินค้าของรอบปกติ &nbsp;(สามารถ update ทับได้)
      </p>
      <p class="mb-4 text-xs font-semibold text-[#FF8F6B]">excel file (.xlsx) เท่านั้น</p>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
        <!-- Left: file input + buttons -->
        <div
          class="relative flex flex-col gap-3 rounded-[10px] bg-white p-5"
          style="box-shadow: 1px 17px 44px 0px rgba(3, 2, 41, 0.07); flex: 1;"
        >
          <!-- File input row -->
          <div class="flex items-center gap-3">
            <div class="flex flex-1 items-center rounded-[10px] border border-[#E5E5E5] bg-[#F7F7F8] px-4 py-2.5">
              <span class="flex-1 truncate text-sm text-[#030229]/20">
                {{ dateFile ? dateFile.name : 'File name - xxxxx_MM_YYYY.xlsx' }}
              </span>
            </div>
            <button
              class="shrink-0 rounded-[10px] bg-[#E9E5E5] px-5 py-2.5 text-sm font-normal text-[#626262] transition-colors hover:bg-gray-300"
              @click="dateFileInput?.click()"
            >
              Browse file
            </button>
            <input
              ref="dateFileInput"
              type="file"
              accept=".xlsx,.xls"
              class="hidden"
              @change="onDateFileChange"
            >
          </div>

          <!-- Upload button -->
          <button
            :disabled="!dateFile || isDateUploading"
            class="flex w-fit items-center gap-2 rounded-[10px] bg-[#605BFF] px-6 py-2.5 text-sm font-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            @click="uploadDate"
          >
            <UIcon
              :name="isDateUploading ? 'i-lucide-loader-2' : 'i-lucide-plus'"
              class="size-4"
              :class="isDateUploading ? 'animate-spin' : ''"
            />
            Upload
          </button>

          <!-- Separator (desktop) -->
          <div class="absolute right-0 top-0 hidden h-full w-px bg-[#000000]/40 lg:block" />
        </div>

        <!-- Right: uploaded file info + export -->
        <div
          class="flex min-w-0 flex-col gap-3 rounded-[10px] bg-white p-5 lg:w-[347px] lg:shrink-0"
          style="box-shadow: 1px 17px 44px 0px rgba(3, 2, 41, 0.07);"
        >
          <p class="truncate text-sm text-[#605BFF]">
            {{ dateUploadedName ? `File :: ${dateUploadedName}` : 'ยังไม่มีไฟล์ที่อัปโหลด' }}
          </p>
          <div class="flex justify-end">
            <button
              :disabled="!dateUploadedName"
              class="rounded-[10px] bg-[#F29339] px-5 py-2.5 text-sm font-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              @click="exportDate"
            >
              Export .xlsx
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
