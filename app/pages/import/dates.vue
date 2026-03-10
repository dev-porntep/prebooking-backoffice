<script setup lang="ts">
import { toast } from 'vue3-toastify'

const { t } = useI18n()

definePageMeta({ title: 'Import Booking Dates', key: route => route.fullPath })
useHead({ title: t('import.dates.title') })

// ── Upload State ────────────────────────────────────
const uploadedFile = ref<File | null>(null)
const isDragOver = ref(false)
const step = ref<'upload' | 'preview' | 'importing' | 'result'>('upload')
const progress = ref(0)
const isDownloading = ref(false)

const steps = computed(() => [
  { key: 'upload', label: t('import.steps.upload'), icon: 'i-lucide-upload-cloud' },
  { key: 'preview', label: t('import.steps.preview'), icon: 'i-lucide-eye' },
  { key: 'importing', label: t('import.steps.importing'), icon: 'i-lucide-loader-2' },
  { key: 'result', label: t('import.steps.done'), icon: 'i-lucide-check-circle-2' },
])

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
  totalRows: 30,
  validRows: 28,
  errorRows: 2,
  sampleRows: [
    { row: 2, prebooking_date: '2026-03-15', pickup_date: '2026-03-20', branch_code: 'BKK-001', valid: true, error: '' },
    { row: 3, prebooking_date: '2026-03-16', pickup_date: '', branch_code: 'BKK-002', valid: false, error: 'pickup_date ว่าง' },
    { row: 4, prebooking_date: '2026-03-17', pickup_date: '2026-03-22', branch_code: 'BKK-001', valid: true, error: '' },
  ],
})

const importResult = ref({ success: 28, failed: 2 })

// ── Handlers ────────────────────────────────────────
const isValidFileType = (file: File) => /\.(xlsx|xls)$/i.test(file.name)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!isValidFileType(file)) {
    toast.error(t('toast.import.invalidType'))
    target.value = ''
    return
  }
  uploadedFile.value = file
  step.value = 'preview'
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  if (!isValidFileType(file)) {
    toast.error(t('toast.import.invalidType'))
    return
  }
  uploadedFile.value = file
  step.value = 'preview'
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => { isDragOver.value = false }

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

watch(step, (newStep) => {
  if (newStep !== 'result') return
  if (importResult.value.failed === 0) {
    toast.success(t('toast.import.success', { count: importResult.value.success }))
  }
  else {
    toast.warning(t('toast.import.partial', {
      success: importResult.value.success,
      failed: importResult.value.failed,
    }))
  }
})

const downloadTemplate = async () => {
  isDownloading.value = true
  try {
    const res = await fetch('/api/templates/dates')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dates-template.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  }
  finally {
    isDownloading.value = false
  }
}

const previewColumns = computed(() => [
  { key: 'row', label: 'Row' },
  { key: 'prebooking_date', label: t('import.dates.preview.col.prebookingDate') },
  { key: 'pickup_date', label: t('import.dates.preview.col.pickupDate') },
  { key: 'branch_code', label: t('import.dates.preview.col.branchCode') },
  { key: 'valid', label: t('import.preview.col.status') },
  { key: 'error', label: t('import.preview.col.remark') },
])

const fileSizeLabel = computed(() => {
  if (!uploadedFile.value) return ''
  const kb = uploadedFile.value.size / 1024
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`
})
</script>

<template>
  <div class="space-y-6">
    <!-- ─── Page identity banner (Amber — Date Flow) ── -->
    <div class="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-sm dark:border-amber-500/[0.14] dark:bg-slate-900">
      <!-- Top accent strip -->
      <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

      <div class="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
        <div class="flex items-start gap-4">
          <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
            <UIcon name="i-lucide-calendar-days" class="size-7 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {{ t('import.dates.title') }}
              </h1>
              <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">DATE RANGE</span>
            </div>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {{ t('import.dates.subtitle') }}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" class="shrink-0" :disabled="isDownloading" @click="downloadTemplate">
          <UIcon
            :name="isDownloading ? 'i-lucide-loader-2' : 'i-lucide-file-spreadsheet'"
            :class="['mr-2 size-4', isDownloading && 'animate-spin']"
          />
          {{ t('import.dates.downloadTemplate') }}
        </Button>
      </div>

      <!-- Date flow visualization -->
      <div class="mx-5 mb-5 flex flex-wrap items-center gap-2">
        <!-- Prebooking date card -->
        <div class="flex flex-1 items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 dark:border-amber-500/[0.15] dark:bg-amber-500/[0.06]">
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-200/60 dark:bg-amber-500/20">
            <UIcon name="i-lucide-calendar-plus" class="size-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-wide text-amber-500 dark:text-amber-600">จอง</p>
            <p class="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">prebooking_date</p>
          </div>
        </div>

        <!-- Arrow -->
        <div class="flex shrink-0 flex-col items-center">
          <UIcon name="i-lucide-move-right" class="size-5 text-amber-300 dark:text-amber-700" />
        </div>

        <!-- Pickup date card -->
        <div class="flex flex-1 items-center gap-3 rounded-xl border border-orange-200/80 bg-orange-50/80 px-4 py-3 dark:border-orange-500/[0.15] dark:bg-orange-500/[0.06]">
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-200/60 dark:bg-orange-500/20">
            <UIcon name="i-lucide-calendar-check" class="size-4 text-orange-700 dark:text-orange-400" />
          </div>
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-wide text-orange-500 dark:text-orange-600">รับ</p>
            <p class="font-mono text-xs font-bold text-orange-800 dark:text-orange-300">pickup_date</p>
          </div>
        </div>

        <!-- Divider -->
        <div class="hidden h-10 w-px bg-slate-200 dark:bg-white/10 sm:block" />

        <!-- Branch -->
        <div class="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-white/[0.07] dark:bg-white/[0.03]">
          <UIcon name="i-lucide-building-2" class="size-4 text-slate-400" />
          <p class="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">branch_code</p>
        </div>
      </div>
    </div>

    <!-- ─── Step progress ─────────────────────────── -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
      <div class="flex items-center">
        <template v-for="(s, idx) in steps" :key="s.key">
          <div class="flex flex-col items-center gap-2">
            <div
              class="flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300"
              :class="{
                'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/25': getStepState(s.key) === 'done',
                'border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/30': getStepState(s.key) === 'active',
                'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600': getStepState(s.key) === 'pending',
              }"
            >
              <UIcon
                :name="getStepState(s.key) === 'done' ? 'i-lucide-check' : s.icon"
                :class="['size-4.5', getStepState(s.key) === 'active' && s.key === 'importing' ? 'animate-spin' : '']"
              />
            </div>
            <p
              class="text-[11px] font-semibold whitespace-nowrap"
              :class="{
                'text-amber-600 dark:text-amber-400': getStepState(s.key) === 'done',
                'text-red-600 dark:text-red-400': getStepState(s.key) === 'active',
                'text-slate-400 dark:text-slate-600': getStepState(s.key) === 'pending',
              }"
            >
              {{ s.label }}
            </p>
          </div>
          <div
            v-if="idx < steps.length - 1"
            class="mb-5 h-0.5 flex-1 overflow-hidden rounded-full transition-all duration-500 bg-slate-200 dark:bg-slate-700"
          >
            <div
              class="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
              :style="{ width: currentStepIndex > idx ? '100%' : '0%' }"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- ─── Step 1: Upload ────────────────────────── -->
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
            ? 'border-2 border-dashed border-amber-500 bg-amber-50/70 dark:bg-amber-500/[0.07]'
            : 'border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 dark:border-slate-700 dark:hover:border-amber-500/60 dark:hover:bg-amber-500/[0.03]'"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <div
            class="mb-6 flex size-20 items-center justify-center rounded-2xl transition-all duration-300"
            :class="isDragOver ? 'bg-amber-100 dark:bg-amber-500/20 scale-110 shadow-lg shadow-amber-500/20' : 'bg-slate-100 dark:bg-slate-800'"
          >
            <UIcon
              name="i-lucide-calendar-days"
              :class="['size-10 transition-colors duration-300', isDragOver ? 'text-amber-600' : 'text-slate-400 dark:text-slate-500']"
            />
          </div>
          <h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
            {{ isDragOver ? t('import.upload.drop') : t('import.upload.drag') }}
          </h3>
          <p class="mb-6 text-sm text-slate-400 dark:text-slate-500">
            {{ t('import.upload.support', { formats: '.xlsx, .xls', size: '50 MB' }) }}
          </p>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-amber-300 hover:text-amber-600 hover:shadow-amber-500/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-amber-500/50 dark:hover:text-amber-400">
              <UIcon name="i-lucide-folder-open" class="size-4" />
              {{ t('import.upload.browse') }}
            </span>
          </div>
          <input type="file" accept=".xlsx,.xls" class="hidden" @change="handleFileSelect">
        </label>
        <div class="border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-info" class="size-3.5 text-amber-400" />
              {{ t('import.upload.tipRows') }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-table" class="size-3.5 text-amber-400" />
              {{ t('import.upload.tipTemplate') }}
            </span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ─── Step 2: Preview ───────────────────────── -->
    <template v-if="step === 'preview'">
      <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div class="flex items-center gap-2.5">
            <div class="flex size-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <UIcon name="i-lucide-file-spreadsheet" class="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-900 dark:text-white">{{ uploadedFile?.name }}</h3>
              <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {{ fileSizeLabel }} · {{ previewData.totalRows }} {{ t('import.preview.rows') }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              <span class="size-1.5 rounded-full bg-amber-500" />
              {{ previewData.validRows }} {{ t('import.preview.valid') }}
            </span>
            <span v-if="previewData.errorRows" class="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
              <span class="size-1.5 rounded-full bg-red-500" />
              {{ previewData.errorRows }} {{ t('import.preview.error') }}
            </span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead v-for="col in previewColumns" :key="col.key">{{ col.label }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(row, idx) in previewData.sampleRows" :key="idx">
              <TableCell><span class="font-mono text-xs text-slate-400">{{ row.row }}</span></TableCell>
              <TableCell>{{ row.prebooking_date }}</TableCell>
              <TableCell>{{ row.pickup_date }}</TableCell>
              <TableCell>{{ row.branch_code }}</TableCell>
              <TableCell>
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="row.valid
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'"
                >
                  <UIcon :name="row.valid ? 'i-lucide-check' : 'i-lucide-x'" class="size-3" />
                  {{ row.valid ? t('import.preview.valid') : t('import.preview.error') }}
                </span>
              </TableCell>
              <TableCell>
                <span v-if="row.error" class="text-xs text-red-500 dark:text-red-400">{{ row.error }}</span>
                <span v-else class="text-xs text-slate-300 dark:text-slate-600">—</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <Button variant="ghost" size="sm" @click="resetImport">
            <UIcon name="i-lucide-arrow-left" class="mr-2 size-4" />
            {{ t('import.preview.back') }}
          </Button>
          <Button size="sm" @click="startImport">
            <UIcon name="i-lucide-play" class="mr-2 size-4" />
            {{ t('import.preview.start', { count: previewData.validRows }) }}
          </Button>
        </div>
      </div>
    </template>

    <!-- ─── Step 3: Importing ─────────────────────── -->
    <div
      v-if="step === 'importing'"
      class="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-8 py-20 text-center shadow-sm dark:border-white/[0.06] dark:bg-slate-900"
    >
      <div class="relative mb-6">
        <div class="absolute inset-0 rounded-full bg-amber-400/15 blur-xl" />
        <div class="relative flex size-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 ring-4 ring-amber-100 dark:ring-amber-500/10">
          <UIcon name="i-lucide-loader-2" class="size-9 animate-spin text-amber-600" />
        </div>
      </div>
      <h3 class="mb-1.5 text-lg font-bold text-slate-900 dark:text-white">{{ t('import.importing.title') }}</h3>
      <p class="mb-8 text-sm text-slate-400 dark:text-slate-500">{{ t('import.importing.desc') }}</p>
      <div class="w-full max-w-sm space-y-2.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400">{{ t('import.importing.progress') }}</span>
          <span class="font-mono font-bold text-amber-600 dark:text-amber-400">{{ Math.round(progress) }}%</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <p class="text-center text-xs text-slate-400 dark:text-slate-500">
          {{ t('import.importing.processing') }} {{ Math.round(progress * previewData.validRows / 100) }} / {{ previewData.validRows }}
        </p>
      </div>
    </div>

    <!-- ─── Step 4: Result ────────────────────────── -->
    <div
      v-if="step === 'result'"
      class="flex flex-col items-center justify-center rounded-2xl border border-amber-100 bg-white px-8 py-20 text-center shadow-sm dark:border-amber-500/[0.12] dark:bg-slate-900"
    >
      <div class="relative mb-6">
        <div class="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl" />
        <div class="relative flex size-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 ring-4 ring-amber-100 dark:ring-amber-500/10">
          <UIcon name="i-lucide-check-circle-2" class="size-10 text-amber-500" />
        </div>
      </div>
      <h3 class="mb-1 text-xl font-bold text-slate-900 dark:text-white">{{ t('import.result.title') }}</h3>
      <p class="mb-8 text-sm text-slate-400 dark:text-slate-500">{{ t('import.result.desc') }}</p>
      <div class="mb-8 flex gap-12">
        <div class="text-center">
          <p class="font-mono text-4xl font-bold text-amber-600 dark:text-amber-400">{{ importResult.success }}</p>
          <div class="mt-2 flex items-center justify-center gap-1.5">
            <span class="size-2 rounded-full bg-amber-500" />
            <p class="text-xs font-medium text-slate-400 dark:text-slate-500">{{ t('import.result.success') }}</p>
          </div>
        </div>
        <div class="w-px bg-slate-100 dark:bg-white/[0.06]" />
        <div class="text-center">
          <p class="font-mono text-4xl font-bold text-red-500 dark:text-red-400">{{ importResult.failed }}</p>
          <div class="mt-2 flex items-center justify-center gap-1.5">
            <span class="size-2 rounded-full bg-red-500" />
            <p class="text-xs font-medium text-slate-400 dark:text-slate-500">{{ t('import.result.failed') }}</p>
          </div>
        </div>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm">
          <UIcon name="i-lucide-download" class="mr-2 size-4" />
          {{ t('import.result.errorReport') }}
        </Button>
        <Button size="sm" @click="resetImport">
          <UIcon name="i-lucide-plus" class="mr-2 size-4" />
          {{ t('import.result.again') }}
        </Button>
      </div>
    </div>
  </div>
</template>
