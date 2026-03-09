<script setup lang="ts">
definePageMeta({
  title: 'Import Excel',
})

useHead({ title: 'Import Excel' })

// ── Upload State ────────────────────────────────────
const uploadedFile = ref<File | null>(null)
const isDragOver = ref(false)
const step = ref<'upload' | 'preview' | 'importing' | 'result'>('upload')
const progress = ref(0)

const steps = [
  { key: 'upload', label: 'อัปโหลดไฟล์', icon: 'i-lucide-upload-cloud' },
  { key: 'preview', label: 'ตรวจสอบ', icon: 'i-lucide-eye' },
  { key: 'importing', label: 'นำเข้าข้อมูล', icon: 'i-lucide-loader-2' },
  { key: 'result', label: 'เสร็จสิ้น', icon: 'i-lucide-check-circle-2' },
]

const stepOrder = ['upload', 'preview', 'importing', 'result']
const currentStepIndex = computed(() => stepOrder.indexOf(step.value))

const getStepState = (key: string) => {
  const idx = stepOrder.indexOf(key)
  if (idx < currentStepIndex.value) return 'done'
  if (idx === currentStepIndex.value) return 'active'
  return 'pending'
}

// ── Mock Preview Data ───────────────────────────────
const previewData = ref({
  totalRows: 150,
  validRows: 147,
  errorRows: 3,
  sampleRows: [
    { row: 2, customer_name: 'สมชาย มานะ', phone_number: '0891234567', device_model: 'iPhone 16 Pro', valid: true, error: '' },
    { row: 3, customer_name: '', phone_number: 'abc', device_model: 'iPhone 16 Pro', valid: false, error: 'ชื่อลูกค้าว่าง, เบอร์โทรไม่ถูกต้อง' },
    { row: 4, customer_name: 'สมหญิง รักดี', phone_number: '0911234567', device_model: 'Samsung S25', valid: true, error: '' },
  ],
})

const importResult = ref({
  success: 147,
  failed: 3,
})

// ── Handlers ────────────────────────────────────────
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    uploadedFile.value = file
    step.value = 'preview'
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    uploadedFile.value = file
    step.value = 'preview'
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const startImport = () => {
  step.value = 'importing'
  progress.value = 0

  const interval = setInterval(() => {
    progress.value += Math.random() * 15
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(interval)
      step.value = 'result'
    }
  }, 300)
}

const resetImport = () => {
  uploadedFile.value = null
  step.value = 'upload'
  progress.value = 0
}

const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/templates/prebooking-template.xlsx'
  link.download = 'prebooking-template.xlsx'
  link.click()
}

// Table columns
const previewColumns = [
  { accessorKey: 'row', header: 'Row' },
  { accessorKey: 'customer_name', header: 'ชื่อลูกค้า' },
  { accessorKey: 'phone_number', header: 'เบอร์โทร' },
  { accessorKey: 'device_model', header: 'รุ่นมือถือ' },
  { accessorKey: 'valid', header: 'สถานะ' },
  { accessorKey: 'error', header: 'หมายเหตุ' },
]

const fileSizeLabel = computed(() => {
  if (!uploadedFile.value) return ''
  const kb = uploadedFile.value.size / 1024
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`
})
</script>

<template>
  <div class="space-y-6">
    <!-- ─── Page header ────────────────────────────────── -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Import Prebooking Data</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">นำเข้าข้อมูลจากไฟล์ Excel (.xlsx, .xls)</p>
      </div>
      <UButton variant="outline" icon="i-lucide-file-spreadsheet" size="sm" class="shrink-0" @click="downloadTemplate">
        ดาวน์โหลด Template
      </UButton>
    </div>

    <!-- ─── Step progress ─────────────────────────────── -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
      <div class="flex items-center">
        <template v-for="(s, idx) in steps" :key="s.key">
          <!-- Step item -->
          <div class="flex flex-col items-center gap-2">
            <!-- Circle -->
            <div
              class="flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300"
              :class="{
                'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25': getStepState(s.key) === 'done',
                'border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/30': getStepState(s.key) === 'active',
                'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600': getStepState(s.key) === 'pending',
              }"
            >
              <UIcon
                :name="getStepState(s.key) === 'done' ? 'i-lucide-check' : s.icon"
                :class="['size-4.5', getStepState(s.key) === 'active' && s.key === 'importing' ? 'animate-spin' : '']"
              />
            </div>
            <!-- Label -->
            <p
              class="text-[11px] font-semibold whitespace-nowrap"
              :class="{
                'text-emerald-600 dark:text-emerald-400': getStepState(s.key) === 'done',
                'text-red-600 dark:text-red-400': getStepState(s.key) === 'active',
                'text-slate-400 dark:text-slate-600': getStepState(s.key) === 'pending',
              }"
            >
              {{ s.label }}
            </p>
          </div>

          <!-- Connector line -->
          <div
            v-if="idx < steps.length - 1"
            class="mb-5 h-0.5 flex-1 overflow-hidden rounded-full transition-all duration-500"
            :class="currentStepIndex > idx ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-700'"
          >
            <div
              class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
              :style="{ width: currentStepIndex > idx ? '100%' : '0%' }"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- ─── Step 1: Upload ────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition-all duration-200 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
      mode="out-in"
    >
      <div
        v-if="step === 'upload'"
        class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900"
      >
        <label
          class="flex cursor-pointer flex-col items-center justify-center p-16 text-center transition-all duration-300"
          :class="isDragOver
            ? 'border-2 border-dashed border-red-600 bg-red-50/70 dark:bg-red-500/[0.07]'
            : 'border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 dark:border-slate-700 dark:hover:border-indigo-500/60 dark:hover:bg-white/[0.02]'"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <!-- Icon -->
          <div
            class="mb-6 flex size-20 items-center justify-center rounded-2xl transition-all duration-300"
            :class="isDragOver ? 'bg-red-100 dark:bg-red-500/20 scale-110 shadow-lg shadow-red-500/20' : 'bg-slate-100 dark:bg-slate-800'"
          >
            <UIcon
              name="i-lucide-upload-cloud"
              :class="['size-10 transition-colors duration-300', isDragOver ? 'text-red-600' : 'text-slate-400 dark:text-slate-500']"
            />
          </div>

          <h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
            {{ isDragOver ? 'วางไฟล์ที่นี่เลย!' : 'ลากไฟล์ Excel มาวางที่นี่' }}
          </h3>
          <p class="mb-6 text-sm text-slate-400 dark:text-slate-500">
            รองรับ <span class="font-medium text-slate-600 dark:text-slate-300">.xlsx, .xls</span> ขนาดไม่เกิน <span class="font-medium text-slate-600 dark:text-slate-300">50 MB</span>
          </p>

          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-red-300 hover:text-red-600 hover:shadow-red-500/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-red-500/50 dark:hover:text-red-400">
              <UIcon name="i-lucide-folder-open" class="size-4" />
              เลือกไฟล์จากเครื่อง
            </span>
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="handleFileSelect"
          >
        </label>

        <!-- Tips row -->
        <div class="border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-info" class="size-3.5 text-red-400" />
              สูงสุด 100,000 แถวต่อไฟล์
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-table" class="size-3.5 text-red-400" />
              ใช้ template ที่ดาวน์โหลดเพื่อป้องกัน error
            </span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ─── Step 2: Preview ───────────────────────────── -->
    <template v-if="step === 'preview'">
      <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div>
            <!-- File info -->
            <div class="flex items-center gap-2.5">
              <div class="flex size-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <UIcon name="i-lucide-file-spreadsheet" class="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900 dark:text-white">{{ uploadedFile?.name }}</h3>
                <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {{ fileSizeLabel }} · {{ previewData.totalRows }} แถว
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <span class="size-1.5 rounded-full bg-emerald-500" />
              {{ previewData.validRows }} ถูกต้อง
            </span>
            <span v-if="previewData.errorRows" class="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
              <span class="size-1.5 rounded-full bg-red-500" />
              {{ previewData.errorRows }} ผิดพลาด
            </span>
          </div>
        </div>

        <!-- Table with error row highlight -->
        <UTable :data="previewData.sampleRows" :columns="previewColumns">
          <template #row-cell="{ row }">
            <span class="font-mono text-xs text-slate-400">{{ row.original.row }}</span>
          </template>

          <template #valid-cell="{ row }">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="row.original.valid
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'"
            >
              <UIcon :name="row.original.valid ? 'i-lucide-check' : 'i-lucide-x'" class="size-3" />
              {{ row.original.valid ? 'ถูกต้อง' : 'ผิดพลาด' }}
            </span>
          </template>

          <template #error-cell="{ row }">
            <span v-if="row.original.error" class="text-xs text-red-500 dark:text-red-400">
              {{ row.original.error }}
            </span>
            <span v-else class="text-xs text-slate-300 dark:text-slate-600">—</span>
          </template>
        </UTable>

        <!-- Actions footer -->
        <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <UButton variant="ghost" color="neutral" icon="i-lucide-arrow-left" size="sm" @click="resetImport">
            เลือกไฟล์ใหม่
          </UButton>
          <UButton icon="i-lucide-play" size="sm" @click="startImport">
            นำเข้า {{ previewData.validRows }} รายการ
          </UButton>
        </div>
      </div>
    </template>

    <!-- ─── Step 3: Importing ─────────────────────────── -->
    <div
      v-if="step === 'importing'"
      class="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-8 py-20 text-center shadow-sm dark:border-white/[0.06] dark:bg-slate-900"
    >
      <div class="relative mb-6">
        <!-- Outer pulse ring -->
        <div class="absolute inset-0 rounded-full bg-red-400/15 blur-xl" />
        <div class="relative flex size-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 ring-4 ring-red-100 dark:ring-red-500/10">
          <UIcon name="i-lucide-loader-2" class="size-9 animate-spin text-red-600" />
        </div>
      </div>

      <h3 class="mb-1.5 text-lg font-bold text-slate-900 dark:text-white">กำลังนำเข้าข้อมูล...</h3>
      <p class="mb-8 text-sm text-slate-400 dark:text-slate-500">กรุณารอสักครู่ อย่าปิดหน้านี้</p>

      <!-- Progress bar -->
      <div class="w-full max-w-sm space-y-2.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400">ความคืบหน้า</span>
          <span class="font-mono font-bold text-red-600 dark:text-red-400">{{ Math.round(progress) }}%</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            class="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-600 transition-all duration-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <p class="text-center text-xs text-slate-400 dark:text-slate-500">
          กำลังประมวลผล {{ Math.round(progress * 1.47) }} / 147 รายการ
        </p>
      </div>
    </div>

    <!-- ─── Step 4: Result ────────────────────────────── -->
    <div
      v-if="step === 'result'"
      class="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-white px-8 py-20 text-center shadow-sm dark:border-emerald-500/[0.12] dark:bg-slate-900"
    >
      <!-- Success icon -->
      <div class="relative mb-6">
        <div class="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl" />
        <div class="relative flex size-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 ring-4 ring-emerald-100 dark:ring-emerald-500/10">
          <UIcon name="i-lucide-check-circle-2" class="size-10 text-emerald-500" />
        </div>
      </div>

      <h3 class="mb-1 text-xl font-bold text-slate-900 dark:text-white">Import เสร็จสิ้น!</h3>
      <p class="mb-8 text-sm text-slate-400 dark:text-slate-500">นำเข้าข้อมูลสำเร็จแล้ว</p>

      <!-- Result stats -->
      <div class="mb-8 flex gap-12">
        <div class="text-center">
          <p class="font-mono text-4xl font-bold text-emerald-600 dark:text-emerald-400">{{ importResult.success }}</p>
          <div class="mt-2 flex items-center gap-1.5 justify-center">
            <span class="size-2 rounded-full bg-emerald-500" />
            <p class="text-xs font-medium text-slate-400 dark:text-slate-500">รายการสำเร็จ</p>
          </div>
        </div>
        <div class="w-px bg-slate-100 dark:bg-white/[0.06]" />
        <div class="text-center">
          <p class="font-mono text-4xl font-bold text-red-500 dark:text-red-400">{{ importResult.failed }}</p>
          <div class="mt-2 flex items-center gap-1.5 justify-center">
            <span class="size-2 rounded-full bg-red-500" />
            <p class="text-xs font-medium text-slate-400 dark:text-slate-500">รายการล้มเหลว</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <UButton variant="outline" icon="i-lucide-download" color="neutral" size="sm">
          ดาวน์โหลด Error Report
        </UButton>
        <UButton icon="i-lucide-plus" size="sm" @click="resetImport">
          Import อีกครั้ง
        </UButton>
      </div>
    </div>
  </div>
</template>
