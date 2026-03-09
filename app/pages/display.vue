<script setup lang="ts">
import type { PrebookingStatus, PrebookingFilter } from '~/types/prebooking'
import { toast } from 'vue3-toastify'

const { t } = useI18n()

definePageMeta({ title: 'Display' })
useHead({ title: 'Display' })

// ── Stats ───────────────────────────────────────────
const stats = computed(() => [
  {
    label: t('display.stats.total'),
    value: 500,
    icon: 'i-lucide-smartphone',
    gradient: 'from-red-600 to-rose-700',
    glow: 'shadow-red-600/20',
    bg: 'bg-red-50 dark:bg-red-500/10',
    iconColor: 'text-red-600 dark:text-red-400',
    accentBar: 'bg-red-600',
    progressBar: 'bg-gradient-to-r from-red-600 to-rose-600',
    trend: '+12%',
    trendUp: true,
    percent: 100,
  },
  {
    label: t('display.stats.pending'),
    value: 120,
    icon: 'i-lucide-clock',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/20',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accentBar: 'bg-amber-500',
    progressBar: 'bg-gradient-to-r from-amber-400 to-orange-500',
    trend: '+5%',
    trendUp: true,
    percent: 24,
  },
  {
    label: t('display.stats.confirmed'),
    value: 350,
    icon: 'i-lucide-check-circle',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accentBar: 'bg-emerald-500',
    progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    trend: '+18%',
    trendUp: true,
    percent: 70,
  },
  {
    label: t('display.stats.cancelled'),
    value: 30,
    icon: 'i-lucide-x-circle',
    gradient: 'from-red-500 to-rose-500',
    glow: 'shadow-red-500/20',
    bg: 'bg-red-50 dark:bg-red-500/10',
    iconColor: 'text-red-600 dark:text-red-400',
    accentBar: 'bg-red-500',
    progressBar: 'bg-gradient-to-r from-red-400 to-rose-500',
    trend: '-3%',
    trendUp: false,
    percent: 6,
  },
])

// ── Filter ──────────────────────────────────────────
const filter = reactive<PrebookingFilter>({
  search: '',
  status: '',
  deviceModel: '',
  branch: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  limit: 20,
})

const statusOptions = computed(() => [
  { label: t('status.all'), value: 'all' },
  { label: t('status.pending'), value: 'pending' },
  { label: t('status.confirmed'), value: 'confirmed' },
  { label: t('status.cancelled'), value: 'cancelled' },
  { label: t('status.completed'), value: 'completed' },
])

const selectedStatus = computed({
  get: () => filter.status || 'all',
  set: (v: string) => { filter.status = v === 'all' ? '' : v as PrebookingStatus },
})

const hasActiveFilters = computed(() =>
  filter.search || filter.status || filter.deviceModel || filter.branch || filter.dateFrom || filter.dateTo,
)

const resetFilters = () => {
  filter.search = ''
  filter.status = ''
  filter.deviceModel = ''
  filter.branch = ''
  filter.dateFrom = ''
  filter.dateTo = ''
  filter.page = 1
}

// ── Table ───────────────────────────────────────────
const columns = computed(() => [
  { accessorKey: 'id', header: t('display.table.col.id') },
  { accessorKey: 'customerName', header: t('display.table.col.customerName') },
  { accessorKey: 'phoneNumber', header: t('display.table.col.phone') },
  { accessorKey: 'deviceModel', header: t('display.table.col.device') },
  { accessorKey: 'branch', header: t('display.table.col.branch') },
  { accessorKey: 'status', header: t('display.table.col.status') },
  { accessorKey: 'prebookingDate', header: t('display.table.col.date') },
  { id: 'actions', header: '' },
])

const mockData = ref([
  { id: '1', customerName: 'สมชาย มานะ', phoneNumber: '089-xxx-xxxx', deviceModel: 'iPhone 16 Pro', branch: 'สาขากลาง', status: 'confirmed' as PrebookingStatus, prebookingDate: '2026-03-15' },
  { id: '2', customerName: 'สมหญิง รักดี', phoneNumber: '091-xxx-xxxx', deviceModel: 'Samsung S25 Ultra', branch: 'สาขาเหนือ', status: 'pending' as PrebookingStatus, prebookingDate: '2026-03-16' },
  { id: '3', customerName: 'สมศรี ใจดี', phoneNumber: '065-xxx-xxxx', deviceModel: 'iPhone 16', branch: 'สาขาใต้', status: 'cancelled' as PrebookingStatus, prebookingDate: '2026-03-14' },
  { id: '4', customerName: 'วิชัย สุขใจ', phoneNumber: '081-xxx-xxxx', deviceModel: 'OPPO Find X8', branch: 'สาขากลาง', status: 'completed' as PrebookingStatus, prebookingDate: '2026-03-13' },
  { id: '5', customerName: 'มานี ดีเลิศ', phoneNumber: '092-xxx-xxxx', deviceModel: 'iPhone 16 Pro Max', branch: 'สาขาตะวันออก', status: 'confirmed' as PrebookingStatus, prebookingDate: '2026-03-17' },
])

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const statusColorMap: Record<PrebookingStatus, BadgeColor> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
}

const statusLabelMap = computed((): Record<PrebookingStatus, string> => ({
  pending: t('status.pending'),
  confirmed: t('status.confirmed'),
  cancelled: t('status.cancelled'),
  completed: t('status.completed'),
}))

// ── Refresh ─────────────────────────────────────────
const handleRefresh = () => {
  toast.success(t('toast.display.refreshed'))
}

// ── Detail Slideover ────────────────────────────────
const selectedItem = ref<typeof mockData.value[0] | null>(null)
const isDetailOpen = ref(false)

const openDetail = (item: typeof mockData.value[0]) => {
  selectedItem.value = item
  isDetailOpen.value = true
}
</script>

<template>
  <div class="space-y-6">
    <!-- ─── Page header ────────────────────────────────── -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {{ t('display.title') }}
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ t('display.updated') }}
        </p>
      </div>
      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" size="sm" class="shrink-0" @click="handleRefresh">
        {{ t('display.refresh') }}
      </UButton>
    </div>

    <!-- ─── Stats grid ─────────────────────────────────── -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[0.06] dark:bg-slate-900"
        :class="'hover:' + stat.glow"
      >
        <!-- Top accent bar -->
        <div :class="['h-1 w-full', stat.accentBar]" />

        <div class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {{ stat.label }}
              </p>
              <p class="mt-2 font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                {{ stat.value.toLocaleString() }}
              </p>
            </div>
            <!-- Icon circle -->
            <div :class="['flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110', stat.bg]">
              <UIcon :name="stat.icon" :class="['size-5', stat.iconColor]" />
            </div>
          </div>

          <!-- Progress bar showing % of total -->
          <div class="mt-4 space-y-1.5">
            <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                :class="['h-full rounded-full transition-all duration-700', stat.progressBar]"
                :style="{ width: `${stat.percent}%` }"
              />
            </div>
            <div class="flex items-center justify-between">
              <div :class="['flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold', stat.trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400']">
                <UIcon :name="stat.trendUp ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="size-3" />
                {{ stat.trend }}
              </div>
              <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">{{ stat.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Filter bar ─────────────────────────────────── -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
      <!-- Header -->
      <div class="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <UIcon name="i-lucide-sliders-horizontal" class="size-4 text-slate-400 dark:text-slate-500" />
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ t('display.filter.title') }}</p>
        <span
          v-if="hasActiveFilters"
          class="ml-auto inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
        >
          <span class="size-1.5 rounded-full bg-red-600" />
          {{ t('display.filter.active') }}
        </span>
      </div>

      <div class="p-4">
        <div class="flex flex-wrap items-end gap-3">
          <UFormField :label="t('display.filter.search')" class="min-w-52 flex-1">
            <UInput
              v-model="filter.search"
              icon="i-lucide-search"
              :placeholder="t('display.filter.searchPlaceholder')"
            />
          </UFormField>

          <UFormField :label="t('display.filter.status')">
            <USelect v-model="selectedStatus" :items="statusOptions" class="w-40" />
          </UFormField>

          <UFormField :label="t('display.filter.dateFrom')">
            <UInput v-model="filter.dateFrom" type="date" class="w-38" />
          </UFormField>

          <UFormField :label="t('display.filter.dateTo')">
            <UInput v-model="filter.dateTo" type="date" class="w-38" />
          </UFormField>

          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-rotate-ccw"
            :disabled="!hasActiveFilters"
            class="text-slate-500 hover:text-slate-900 disabled:opacity-40 dark:hover:text-white"
            @click="resetFilters"
          >
            {{ t('display.filter.reset') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- ─── Data table ─────────────────────────────────── -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
      <!-- Table header bar -->
      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <div class="flex items-center gap-2.5">
          <div class="size-2 rounded-full bg-red-600" style="box-shadow:0 0 6px 2px rgba(224,0,0,0.5)" />
          <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ t('display.table.title') }}</p>
        </div>
        <div class="flex items-center gap-2">
          <UBadge color="neutral" variant="subtle" size="sm">
            500 {{ t('display.table.items') }}
          </UBadge>
          <UButton icon="i-lucide-download" color="neutral" variant="ghost" size="xs">
            Export
          </UButton>
        </div>
      </div>

      <UTable :data="mockData" :columns="columns" class="w-full">
        <template #id-cell="{ row }">
          <span class="font-mono text-xs text-slate-400 dark:text-slate-500">#{{ row.original.id }}</span>
        </template>

        <template #customerName-cell="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-[10px] font-bold text-white">
              {{ row.original.customerName[0] }}
            </div>
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ row.original.customerName }}</span>
          </div>
        </template>

        <template #phoneNumber-cell="{ row }">
          <span class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ row.original.phoneNumber }}</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="statusColorMap[row.original.status]" variant="subtle" size="sm">
            {{ statusLabelMap[row.original.status] }}
          </UBadge>
        </template>

        <template #prebookingDate-cell="{ row }">
          <span class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ row.original.prebookingDate }}</span>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="openDetail(row.original)"
          />
        </template>
      </UTable>

      <!-- Pagination -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <p class="text-xs text-slate-400 dark:text-slate-500">
          {{ t('display.table.showing') }} {{ (filter.page - 1) * filter.limit + 1 }}–{{ Math.min(filter.page * filter.limit, 500) }} {{ t('display.table.from') }} 500 {{ t('display.table.items') }}
        </p>
        <UPagination v-model="filter.page" :total="500" :items-per-page="filter.limit" />
      </div>
    </div>

    <!-- ─── Detail Slideover ───────────────────────────── -->
    <USlideover v-model:open="isDetailOpen" :title="t('display.detail.title')">
      <template v-if="selectedItem">
        <div class="space-y-5 p-6">
          <!-- Status + ID -->
          <div class="flex items-center gap-3">
            <UBadge :color="statusColorMap[selectedItem.status]" variant="subtle" size="lg">
              {{ statusLabelMap[selectedItem.status] }}
            </UBadge>
            <span class="font-mono text-xs text-slate-400 dark:text-slate-500">#{{ selectedItem.id }}</span>
          </div>

          <!-- Customer avatar -->
          <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-lg font-bold text-white shadow-lg shadow-red-600/25">
              {{ selectedItem.customerName[0] }}
            </div>
            <div>
              <p class="font-semibold text-slate-900 dark:text-white">{{ selectedItem.customerName }}</p>
              <p class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ selectedItem.phoneNumber }}</p>
            </div>
          </div>

          <!-- Detail grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ t('display.detail.device') }}</p>
              <p class="mt-1.5 font-semibold text-slate-900 dark:text-white">{{ selectedItem.deviceModel }}</p>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ t('display.detail.branch') }}</p>
              <p class="mt-1.5 font-semibold text-slate-900 dark:text-white">{{ selectedItem.branch }}</p>
            </div>
            <div class="col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ t('display.detail.date') }}</p>
              <p class="mt-1.5 font-mono font-semibold text-slate-900 dark:text-white">{{ selectedItem.prebookingDate }}</p>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
