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

interface ExportHistoryItem {
  id: string
  createdAt: string
  filters: string
  totalRows: number
  downloadUrl: string
}

const { data: historyData } = await useAsyncData(
  'export-history',
  () => $fetch<{ data: ExportHistoryItem[] }>('/api/export/history'),
)

const exportHistory = computed(() => historyData.value?.data ?? [])

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
          <div class="space-y-2">
            <Label>{{ t('export.dateFrom') }}</Label>
            <Input v-model="exportFilter.dateFrom" type="date" />
          </div>
          <div class="space-y-2">
            <Label>{{ t('export.dateTo') }}</Label>
            <Input v-model="exportFilter.dateTo" type="date" />
          </div>
          <div class="space-y-2">
            <Label>{{ t('export.status') }}</Label>
            <Select v-model="selectedStatus">
              <SelectTrigger>
                <SelectValue :placeholder="t('export.status')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>{{ t('export.device') }}</Label>
            <Input v-model="exportFilter.deviceModel" :placeholder="t('export.devicePlaceholder')" />
          </div>
          <div class="space-y-2">
            <Label>{{ t('export.branch') }}</Label>
            <Input v-model="exportFilter.branch" :placeholder="t('export.branchPlaceholder')" />
          </div>
        </div>

        <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/[0.05]">
          <Button
            variant="ghost"
            size="sm"
            :disabled="!hasFilters"
            class="disabled:opacity-40"
            @click="resetFilter"
          >
            <UIcon name="i-lucide-rotate-ccw" class="mr-2 size-4" />
            {{ t('export.reset') }}
          </Button>
          <div class="flex items-center gap-3">
            <p v-if="hasFilters" class="text-xs text-slate-400 dark:text-slate-500">
              <span class="inline-flex items-center gap-1">
                <span class="size-1.5 rounded-full bg-red-500" />
                {{ t('export.activeFilter') }}
              </span>
            </p>
            <Button size="sm" :disabled="isExporting" @click="startExport">
              <UIcon v-if="isExporting" name="i-lucide-loader-2" class="mr-2 size-4 animate-spin" />
              <UIcon v-else name="i-lucide-download" class="mr-2 size-4" />
              {{ t('export.start') }}
            </Button>
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
        <Badge variant="secondary">{{ exportHistory.length }} {{ t('export.history.items') }}</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="col in historyColumns" :key="col.accessorKey || col.id">{{ col.header }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in exportHistory" :key="row.id">
            <TableCell>
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500">#{{ row.id }}</span>
            </TableCell>
            <TableCell>
              <span class="font-mono text-sm text-slate-600 dark:text-slate-400">{{ row.createdAt }}</span>
            </TableCell>
            <TableCell>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                <UIcon name="i-lucide-filter" class="size-3 text-slate-400" />
                {{ row.filters }}
              </span>
            </TableCell>
            <TableCell>
              <span class="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                {{ row.totalRows.toLocaleString() }}
              </span>
              <span class="ml-1 text-xs text-slate-400">{{ t('export.history.rows') }}</span>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" @click="handleDownload">
                <UIcon name="i-lucide-download" class="mr-2 size-4" />
                {{ t('export.history.download') }}
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
