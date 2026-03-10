<script setup lang="ts">
import type { PrebookingStatus, PrebookingFilter } from '~/types/prebooking'
import { toast } from 'vue3-toastify'

const { t } = useI18n()

definePageMeta({ title: 'Home' })
useHead({ title: 'Home' })

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

// ── SSR Data Fetching ────────────────────────────────
const { data: prebookingData, refresh, pending: isLoading } = await useAsyncData(
  'prebookings',
  () => $fetch('/api/prebooking', { query: toRaw(filter) }),
  { watch: [filter] },
)

const rows = computed(() => prebookingData.value?.data ?? [])
const total = computed(() => prebookingData.value?.total ?? 0)
const apiStats = computed(() => prebookingData.value?.stats)

// ── Stats ───────────────────────────────────────────
const stats = computed(() => {
  const s = apiStats.value
  const pendingPct = s?.total ? Math.round((s.pending / s.total) * 100) : 0
  const confirmedPct = s?.total ? Math.round((s.confirmed / s.total) * 100) : 0
  const cancelledPct = s?.total ? Math.round((s.cancelled / s.total) * 100) : 0

  return [
    {
      label: t('home.stats.total'),
      value: s?.total ?? 0,
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
      label: t('home.stats.pending'),
      value: s?.pending ?? 0,
      icon: 'i-lucide-clock',
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/20',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accentBar: 'bg-amber-500',
      progressBar: 'bg-gradient-to-r from-amber-400 to-orange-500',
      trend: '+5%',
      trendUp: true,
      percent: pendingPct,
    },
    {
      label: t('home.stats.confirmed'),
      value: s?.confirmed ?? 0,
      icon: 'i-lucide-check-circle',
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/20',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accentBar: 'bg-emerald-500',
      progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      trend: '+18%',
      trendUp: true,
      percent: confirmedPct,
    },
    {
      label: t('home.stats.cancelled'),
      value: s?.cancelled ?? 0,
      icon: 'i-lucide-x-circle',
      gradient: 'from-red-500 to-rose-500',
      glow: 'shadow-red-500/20',
      bg: 'bg-red-50 dark:bg-red-500/10',
      iconColor: 'text-red-600 dark:text-red-400',
      accentBar: 'bg-red-500',
      progressBar: 'bg-gradient-to-r from-red-400 to-rose-500',
      trend: '-3%',
      trendUp: false,
      percent: cancelledPct,
    },
  ]
})

// ── Filter helpers ───────────────────────────────────
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
  { accessorKey: 'id', header: t('home.table.col.id') },
  { accessorKey: 'customerName', header: t('home.table.col.customerName') },
  { accessorKey: 'phoneNumber', header: t('home.table.col.phone') },
  { accessorKey: 'deviceModel', header: t('home.table.col.device') },
  { accessorKey: 'branch', header: t('home.table.col.branch') },
  { accessorKey: 'status', header: t('home.table.col.status') },
  { accessorKey: 'prebookingDate', header: t('home.table.col.date') },
  { id: 'actions', header: '' },
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
const handleRefresh = async () => {
  await refresh()
  toast.success(t('toast.home.refreshed'))
}

// ── Detail Slideover ────────────────────────────────
type RowItem = NonNullable<typeof prebookingData.value>['data'][number]
const selectedItem = ref<RowItem | null>(null)
const isDetailOpen = ref(false)

const openDetail = (item: RowItem) => {
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
          {{ t('home.title') }}
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ t('home.updated') }}
        </p>
      </div>
      <Button variant="outline" size="sm" class="shrink-0" :disabled="isLoading" @click="handleRefresh">
        <UIcon name="i-lucide-refresh-cw" :class="['mr-2 size-4', isLoading && 'animate-spin']" />
        {{ t('home.refresh') }}
      </Button>
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
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ t('home.filter.title') }}</p>
        <span
          v-if="hasActiveFilters"
          class="ml-auto inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
        >
          <span class="size-1.5 rounded-full bg-red-600" />
          {{ t('home.filter.active') }}
        </span>
      </div>

      <div class="p-4">
        <div class="flex flex-wrap items-end gap-3">
          <div class="space-y-2 min-w-52 flex-1">
            <Label>{{ t('home.filter.search') }}</Label>
            <div class="relative w-full items-center">
              <Input v-model="filter.search" :placeholder="t('home.filter.searchPlaceholder')" class="pl-10" />
              <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                <UIcon name="i-lucide-search" class="size-4 text-slate-400" />
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <Label>{{ t('home.filter.status') }}</Label>
            <Select v-model="selectedStatus">
              <SelectTrigger class="w-40">
                <SelectValue :placeholder="t('home.filter.status')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>{{ t('home.filter.dateFrom') }}</Label>
            <Input v-model="filter.dateFrom" type="date" class="w-38" />
          </div>

          <div class="space-y-2">
            <Label>{{ t('home.filter.dateTo') }}</Label>
            <Input v-model="filter.dateTo" type="date" class="w-38" />
          </div>

          <Button
            variant="ghost"
            :disabled="!hasActiveFilters"
            class="text-slate-500 hover:text-slate-900 disabled:opacity-40 dark:hover:text-white"
            @click="resetFilters"
          >
            <UIcon name="i-lucide-rotate-ccw" class="mr-2 size-4" />
            {{ t('home.filter.reset') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- ─── Data table ─────────────────────────────────── -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
      <!-- Table header bar -->
      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <div class="flex items-center gap-2.5">
          <div class="size-2 rounded-full bg-red-600" style="box-shadow:0 0 6px 2px rgba(224,0,0,0.5)" />
          <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ t('home.table.title') }}</p>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="secondary">
            {{ total.toLocaleString() }} {{ t('home.table.items') }}
          </Badge>
          <Button variant="ghost" size="sm">
            <UIcon name="i-lucide-download" class="mr-2 size-4" />
            Export
          </Button>
        </div>
      </div>

      <div class="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead v-for="col in columns" :key="col.accessorKey || col.id">{{ col.header }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell :colspan="columns.length" class="h-24 text-center">
                <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-slate-400 mx-auto" />
              </TableCell>
            </TableRow>
            <TableRow v-else-if="rows.length === 0">
              <TableCell :colspan="columns.length" class="h-24 text-center text-slate-500">
                No results.
              </TableCell>
            </TableRow>
            <TableRow v-else v-for="row in rows" :key="row.id">
              <TableCell><span class="font-mono text-xs text-slate-400 dark:text-slate-500">#{{ row.id }}</span></TableCell>
              <TableCell>
                <div class="flex items-center gap-2.5">
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-[10px] font-bold text-white">
                    {{ row.customerName[0] }}
                  </div>
                  <span class="font-medium text-slate-800 dark:text-slate-200">{{ row.customerName }}</span>
                </div>
              </TableCell>
              <TableCell><span class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ row.phoneNumber }}</span></TableCell>
              <TableCell>{{ row.deviceModel }}</TableCell>
              <TableCell>{{ row.preferredBranch }}</TableCell>
              <TableCell>
                <Badge :variant="statusColorMap[row.status as PrebookingStatus] === 'success' ? 'default' : 'secondary'">
                  {{ statusLabelMap[row.status as PrebookingStatus] }}
                </Badge>
              </TableCell>
              <TableCell><span class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ row.prebookingDate }}</span></TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" @click="openDetail(row)">
                  <UIcon name="i-lucide-eye" class="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <p class="text-xs text-slate-400 dark:text-slate-500">
          {{ t('home.table.showing') }} {{ (filter.page - 1) * filter.limit + 1 }}–{{ Math.min(filter.page * filter.limit, total) }} {{ t('home.table.from') }} {{ total.toLocaleString() }} {{ t('home.table.items') }}
        </p>
        <Pagination v-model:page="filter.page" :total="total" :items-per-page="filter.limit" :sibling-count="1" show-edges>
          <PaginationContent v-slot="{ items }" class="flex items-center gap-1">
            <PaginationFirst />
            <PaginationPrevious />
            <template v-for="(item, index) in items" :key="index">
              <PaginationItem v-if="item.type === 'page'" :value="item.value" as-child>
                <Button class="w-9 h-9 p-0" :variant="item.value === filter.page ? 'default' : 'outline'" @click="filter.page = item.value">
                  {{ item.value }}
                </Button>
              </PaginationItem>
              <PaginationEllipsis v-else :index="index" />
            </template>
            <PaginationNext />
            <PaginationLast />
          </PaginationContent>
        </Pagination>
      </div>
    </div>

    <!-- ─── Detail Slideover ───────────────────────────── -->
    <Sheet v-model:open="isDetailOpen">
      <SheetContent class="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{{ t('home.detail.title') }}</SheetTitle>
        </SheetHeader>
        <template v-if="selectedItem">
          <div class="space-y-5 py-6">
            <!-- Status + ID -->
            <div class="flex items-center gap-3">
              <Badge variant="secondary" class="text-xs px-2.5 py-0.5">
                {{ statusLabelMap[selectedItem.status as PrebookingStatus] }}
              </Badge>
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
                <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ t('home.detail.device') }}</p>
                <p class="mt-1.5 font-semibold text-slate-900 dark:text-white">{{ selectedItem.deviceModel }}</p>
              </div>
              <div class="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ t('home.detail.branch') }}</p>
                <p class="mt-1.5 font-semibold text-slate-900 dark:text-white">{{ selectedItem.preferredBranch }}</p>
              </div>
              <div class="col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ t('home.detail.date') }}</p>
                <p class="mt-1.5 font-mono font-semibold text-slate-900 dark:text-white">{{ selectedItem.prebookingDate }}</p>
              </div>
            </div>
          </div>
        </template>
      </SheetContent>
    </Sheet>
  </div>
</template>
