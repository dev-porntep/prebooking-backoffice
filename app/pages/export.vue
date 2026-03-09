<script setup lang="ts">
import { toast } from 'vue3-toastify'

const { t } = useI18n()

definePageMeta({ title: 'Export Excel' })
useHead({ title: 'Export Excel' })

// ── Filter ──────────────────────────────────────────
const exportFilter = reactive({
  dateFrom: '',
  dateTo: '',
  status: '',
  deviceModel: '',
  branch: '',
})

const statusOptions = computed(() => [
  { label: t('status.all'), value: 'all' },
  { label: t('status.pending'), value: 'pending' },
  { label: t('status.confirmed'), value: 'confirmed' },
  { label: t('status.cancelled'), value: 'cancelled' },
  { label: t('status.completed'), value: 'completed' },
])

const selectedStatus = computed({
  get: () => exportFilter.status || 'all',
  set: (v: string) => { exportFilter.status = v === 'all' ? '' : v },
})

const isExporting = ref(false)
const exportProgress = ref(0)

const resetFilter = () => {
  exportFilter.dateFrom = ''
  exportFilter.dateTo = ''
  exportFilter.status = ''
  exportFilter.deviceModel = ''
  exportFilter.branch = ''
}

const setDateRange = (days: number) => {
  const today = new Date()
  const from = new Date()
  from.setDate(today.getDate() - days + 1)
  exportFilter.dateTo = today.toISOString().split('T')[0] ?? ''
  exportFilter.dateFrom = from.toISOString().split('T')[0] ?? ''
}

const setToday = () => {
  const today = new Date().toISOString().split('T')[0] ?? ''
  exportFilter.dateFrom = today
  exportFilter.dateTo = today
}

const startExport = () => {
  isExporting.value = true
  exportProgress.value = 0
  const interval = setInterval(() => {
    exportProgress.value += Math.random() * 20
    if (exportProgress.value >= 100) {
      exportProgress.value = 100
      clearInterval(interval)
      isExporting.value = false
      toast.success(t('toast.export.success'))
    }
  }, 500)
}

const handleDownload = () => {
  toast.info(t('toast.export.download'))
}

// ── Export History ────────────────────────────────────
const historyColumns = computed(() => [
  { accessorKey: 'id', header: '#' },
  { accessorKey: 'createdAt', header: t('export.history.colDate') },
  { accessorKey: 'filters', header: t('export.history.colFilter') },
  { accessorKey: 'totalRows', header: t('export.history.colRows') },
  { id: 'actions', header: '' },
])

const mockHistory = ref([
  { id: '1', createdAt: '2026-03-09 14:00', filters: 'ทั้งหมด', totalRows: 500, downloadUrl: '#' },
  { id: '2', createdAt: '2026-03-08 10:30', filters: 'สถานะ: รอดำเนินการ', totalRows: 120, downloadUrl: '#' },
  { id: '3', createdAt: '2026-03-07 09:15', filters: 'รุ่น: iPhone 16', totalRows: 85, downloadUrl: '#' },
])

const hasFilters = computed(() =>
  exportFilter.dateFrom || exportFilter.dateTo || exportFilter.status || exportFilter.deviceModel || exportFilter.branch,
)
</script>

<template>
  <div class="space-y-6">
    <!-- ─── Page header ────────────────────────────────── -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{{ t('export.title') }}</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('export.subtitle') }}</p>
    </div>

    <!-- ─── Filter & Export card ─────────────────────── -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
      <div class="border-b border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <div class="flex items-center gap-2.5">
          <div class="flex size-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
            <UIcon name="i-lucide-sliders-horizontal" class="size-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">{{ t('export.condition') }}</h3>
            <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{{ t('export.conditionDesc') }}</p>
          </div>
        </div>
      </div>

      <div class="p-5">
        <!-- Quick date shortcuts -->
        <div class="mb-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ t('export.quickDate') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(item, idx) in [
                { label: t('export.today'), action: setToday },
                { label: t('export.last7'), action: () => setDateRange(7) },
                { label: t('export.last30'), action: () => setDateRange(30) },
                { label: t('export.last90'), action: () => setDateRange(90) },
              ]"
              :key="idx"
              class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              @click="item.action"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UFormField :label="t('export.dateFrom')">
            <UInput v-model="exportFilter.dateFrom" type="date" />
          </UFormField>
          <UFormField :label="t('export.dateTo')">
            <UInput v-model="exportFilter.dateTo" type="date" />
          </UFormField>
          <UFormField :label="t('export.status')">
            <USelect v-model="selectedStatus" :items="statusOptions" />
          </UFormField>
          <UFormField :label="t('export.device')">
            <UInput v-model="exportFilter.deviceModel" :placeholder="t('export.devicePlaceholder')" />
          </UFormField>
          <UFormField :label="t('export.branch')">
            <UInput v-model="exportFilter.branch" :placeholder="t('export.branchPlaceholder')" />
          </UFormField>
        </div>

        <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/[0.05]">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-rotate-ccw"
            size="sm"
            :disabled="!hasFilters"
            class="disabled:opacity-40"
            @click="resetFilter"
          >
            {{ t('export.reset') }}
          </UButton>
          <div class="flex items-center gap-3">
            <p v-if="hasFilters" class="text-xs text-slate-400 dark:text-slate-500">
              <span class="inline-flex items-center gap-1">
                <span class="size-1.5 rounded-full bg-red-500" />
                {{ t('export.activeFilter') }}
              </span>
            </p>
            <UButton icon="i-lucide-download" size="sm" :loading="isExporting" @click="startExport">
              {{ t('export.start') }}
            </UButton>
          </div>
        </div>
      </div>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isExporting"
          class="border-t border-red-100 bg-red-50/60 px-5 py-4 dark:border-red-500/10 dark:bg-red-500/[0.05]"
        >
          <div class="flex items-center gap-4">
            <UIcon name="i-lucide-loader-2" class="size-5 shrink-0 animate-spin text-red-600" />
            <div class="flex-1 space-y-1.5">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('export.generating') }}</p>
                <span class="font-mono text-xs font-bold text-red-600 dark:text-red-400">{{ Math.round(exportProgress) }}%</span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-red-100 dark:bg-red-500/15">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-600 transition-all duration-500"
                  :style="{ width: `${exportProgress}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ─── Export History ────────────────────────────── -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <div class="flex items-center gap-2.5">
          <div class="size-2 rounded-full bg-red-500" style="box-shadow:0 0 6px 2px rgba(224,0,0,0.5)" />
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">{{ t('export.history.title') }}</h3>
            <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{{ t('export.history.subtitle') }}</p>
          </div>
        </div>
        <UBadge color="neutral" variant="subtle" size="sm">{{ mockHistory.length }} {{ t('export.history.items') }}</UBadge>
      </div>

      <UTable :data="mockHistory" :columns="historyColumns">
        <template #id-cell="{ row }">
          <span class="font-mono text-xs text-slate-400 dark:text-slate-500">#{{ row.original.id }}</span>
        </template>
        <template #createdAt-cell="{ row }">
          <span class="font-mono text-sm text-slate-600 dark:text-slate-400">{{ row.original.createdAt }}</span>
        </template>
        <template #filters-cell="{ row }">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
            <UIcon name="i-lucide-filter" class="size-3 text-slate-400" />
            {{ row.original.filters }}
          </span>
        </template>
        <template #totalRows-cell="{ row }">
          <span class="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
            {{ row.original.totalRows.toLocaleString() }}
          </span>
          <span class="ml-1 text-xs text-slate-400">{{ t('export.history.rows') }}</span>
        </template>
        <template #actions-cell>
          <UButton
            icon="i-lucide-download"
            color="neutral"
            variant="ghost"
            size="xs"
            :label="t('export.history.download')"
            @click="handleDownload"
          />
        </template>
      </UTable>
    </div>
  </div>
</template>
