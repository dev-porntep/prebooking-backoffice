<script setup lang="ts">
import type { LogEntry } from '~/../../server/api/logs/entries.get'

const { t } = useI18n()

definePageMeta({ title: 'Logs' })
useHead({ title: 'Logs' })

// ─── State ────────────────────────────────────────────────────────────────────

interface LogFile {
  name:       string
  path:       string
  sizeBytes:  number
  modifiedAt: string
}

const files        = ref<LogFile[]>([])
const selectedFile = ref<string>('')
const entries      = ref<LogEntry[]>([])
const total        = ref(0)
const totalPages   = ref(1)
const page         = ref(1)
const levelFilter  = ref('ALL')
const search       = ref('')
const searchInput  = ref('')
const isLoading    = ref(false)
const selected     = ref<LogEntry | null>(null)
const isDetailOpen = ref(false)

const LEVELS = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG']

// ─── Load file list ───────────────────────────────────────────────────────────

const { data: listData } = await useFetch('/api/logs/list')
if (listData.value?.files?.length) {
  files.value = listData.value.files as LogFile[]
  selectedFile.value = files.value[0]?.name ?? ''
}

// ─── Load entries ─────────────────────────────────────────────────────────────

async function loadEntries() {
  if (!selectedFile.value) return
  isLoading.value = true
  try {
    const res = await $fetch<{ data: LogEntry[], total: number, totalPages: number, page: number }>('/api/logs/entries', {
      query: {
        file:   selectedFile.value,
        page:   page.value,
        level:  levelFilter.value,
        search: search.value || undefined,
      },
    })
    entries.value  = res.data
    total.value    = res.total
    totalPages.value = res.totalPages
  }
  finally {
    isLoading.value = false
  }
}

// Load on mount
await loadEntries()

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch([selectedFile, levelFilter, search], () => {
  page.value = 1
  loadEntries()
})

watch(page, loadEntries)

function applySearch() {
  search.value = searchInput.value
}

function clearSearch() {
  searchInput.value = ''
  search.value = ''
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const levelColor = (level: string) => {
  switch (level?.toUpperCase()) {
    case 'ERROR': return 'bg-red-500/15 text-red-400 ring-red-500/20'
    case 'WARN':  return 'bg-amber-500/15 text-amber-400 ring-amber-500/20'
    case 'DEBUG': return 'bg-violet-500/15 text-violet-400 ring-violet-500/20'
    default:      return 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20'
  }
}

const resultColor = (code: string | undefined) => {
  const n = Number(code)
  if (!code) return 'text-slate-500'
  if (n >= 500) return 'text-red-400 font-bold'
  if (n >= 400) return 'text-amber-400 font-bold'
  return 'text-emerald-400'
}

const tryPrettyJson = (raw: string | undefined) => {
  if (!raw) return ''
  try { return JSON.stringify(JSON.parse(raw), null, 2) }
  catch { return raw }
}

function openDetail(entry: LogEntry) {
  selected.value   = entry
  isDetailOpen.value = true
}
</script>

<template>
  <div class="space-y-5">
    <!-- ─── Page banner ──────────────────────────────────────────── -->
    <div class="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-slate-900">
      <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500" />
      <div class="flex items-start gap-4 px-5 py-5">
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-600/30">
          <UIcon name="i-lucide-file-text" class="size-7 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {{ t('logs.title') }}
            </h1>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">SERVER</span>
          </div>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('logs.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- ─── No file warning ──────────────────────────────────────── -->
    <div
      v-if="!files.length"
      class="flex flex-col items-center gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/60 px-6 py-12 text-center dark:border-amber-500/20 dark:bg-amber-500/[0.06]"
    >
      <div class="flex size-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/15">
        <UIcon name="i-lucide-folder-open" class="size-7 text-amber-600 dark:text-amber-400" />
      </div>
      <p class="font-semibold text-slate-700 dark:text-slate-200">{{ t('logs.noFiles') }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('logs.noFilesHint') }}</p>
    </div>

    <template v-else>
      <!-- ─── Controls row ───────────────────────────────────────── -->
      <div class="flex flex-wrap items-end gap-3">
        <!-- File selector -->
        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.file') }}</label>
          <div class="relative">
            <select
              v-model="selectedFile"
              class="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option v-for="f in files" :key="f.name" :value="f.name">
                {{ f.name }} ({{ formatBytes(f.sizeBytes) }})
              </option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <!-- Level filter -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.level') }}</label>
          <div class="flex gap-1">
            <button
              v-for="lvl in LEVELS"
              :key="lvl"
              class="rounded-lg px-3 py-2 text-xs font-semibold transition-all"
              :class="levelFilter === lvl
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700'"
              @click="levelFilter = lvl"
            >
              {{ lvl }}
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.search') }}</label>
          <div class="flex gap-2">
            <div class="relative">
              <UIcon name="i-lucide-search" class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchInput"
                type="text"
                :placeholder="t('logs.searchPlaceholder')"
                class="rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600"
                @keyup.enter="applySearch"
              >
            </div>
            <button
              class="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
              @click="applySearch"
            >
              <UIcon name="i-lucide-search" class="size-4" />
            </button>
            <button
              v-if="search"
              class="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800"
              @click="clearSearch"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </div>
        </div>

        <!-- Refresh -->
        <button
          class="flex size-[38px] items-center justify-center rounded-xl ring-1 ring-slate-200 transition hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800"
          :class="isLoading ? 'opacity-60 pointer-events-none' : ''"
          @click="loadEntries"
        >
          <UIcon name="i-lucide-refresh-cw" class="size-4 text-slate-500" :class="isLoading ? 'animate-spin' : ''" />
        </button>
      </div>

      <!-- ─── Stats bar ───────────────────────────────────────────── -->
      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <UIcon name="i-lucide-list" class="size-4" />
        <span>{{ t('logs.found', { n: total }) }}</span>
        <template v-if="search">
          <span>·</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">"{{ search }}"</span>
        </template>
      </div>

      <!-- ─── Table ───────────────────────────────────────────────── -->
      <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
        <!-- Header -->
        <div class="grid grid-cols-[110px_64px_64px_1fr_72px_72px] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.col.time') }}</p>
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.col.level') }}</p>
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.col.method') }}</p>
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.col.endpoint') }}</p>
          <p class="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.col.status') }}</p>
          <p class="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.col.elapsed') }}</p>
        </div>

        <!-- Loading skeleton -->
        <template v-if="isLoading">
          <div v-for="i in 8" :key="i" class="grid animate-pulse grid-cols-[110px_64px_64px_1fr_72px_72px] gap-3 border-b border-slate-100/60 px-4 py-3 dark:border-white/[0.04]">
            <div class="h-4 rounded bg-slate-100 dark:bg-slate-800" />
            <div class="h-4 rounded bg-slate-100 dark:bg-slate-800" />
            <div class="h-4 w-10 rounded bg-slate-100 dark:bg-slate-800" />
            <div class="h-4 rounded bg-slate-100 dark:bg-slate-800" />
            <div class="h-4 w-10 justify-self-end rounded bg-slate-100 dark:bg-slate-800" />
            <div class="h-4 w-14 justify-self-end rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="!entries.length">
          <div class="flex flex-col items-center gap-3 py-16 text-center">
            <UIcon name="i-lucide-inbox" class="size-10 text-slate-300 dark:text-slate-600" />
            <p class="text-sm text-slate-400">{{ t('logs.noEntries') }}</p>
          </div>
        </template>

        <!-- Rows -->
        <template v-else>
          <button
            v-for="(entry, i) in entries"
            :key="i"
            class="grid w-full grid-cols-[110px_64px_64px_1fr_72px_72px] gap-3 border-b border-slate-100/60 px-4 py-2.5 text-left transition-colors hover:bg-slate-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
            :class="entry.level?.toUpperCase() === 'ERROR' ? 'bg-red-50/40 dark:bg-red-500/[0.04]' : ''"
            @click="openDetail(entry)"
          >
            <!-- Time -->
            <div class="flex flex-col gap-0.5">
              <span class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ formatTime(entry.time) }}</span>
              <span class="font-mono text-[10px] text-slate-400">{{ formatDate(entry.time) }}</span>
            </div>

            <!-- Level badge -->
            <span
              class="inline-flex h-5 w-fit items-center rounded-md px-1.5 text-[10px] font-bold ring-1"
              :class="levelColor(entry.level)"
            >
              {{ entry.level }}
            </span>

            <!-- Method -->
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400">{{ entry.method ?? '—' }}</span>

            <!-- Endpoint / msg -->
            <span class="truncate text-xs text-slate-700 dark:text-slate-300">
              {{ entry.endpoint || entry.step_name || entry.msg }}
            </span>

            <!-- Status code -->
            <span class="text-right font-mono text-xs" :class="resultColor(entry.result_code)">
              {{ entry.result_code ?? '—' }}
            </span>

            <!-- Elapsed time -->
            <span class="text-right font-mono text-xs text-slate-400">
              {{ entry.elapsed_time != null ? `${entry.elapsed_time}ms` : '—' }}
            </span>
          </button>
        </template>
      </div>

      <!-- ─── Pagination ──────────────────────────────────────────── -->
      <div v-if="totalPages > 1" class="flex items-center justify-between">
        <p class="text-sm text-slate-500">
          {{ t('logs.page', { page, total: totalPages }) }}
        </p>
        <div class="flex gap-1.5">
          <button
            :disabled="page <= 1"
            class="flex size-9 items-center justify-center rounded-xl ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40 dark:ring-slate-700 dark:hover:bg-slate-800"
            @click="page--"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4 text-slate-500" />
          </button>
          <button
            v-for="p in Math.min(totalPages, 7)"
            :key="p"
            class="flex size-9 items-center justify-center rounded-xl text-sm transition"
            :class="p === page
              ? 'bg-slate-800 font-semibold text-white dark:bg-slate-200 dark:text-slate-900'
              : 'ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50 dark:ring-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'"
            @click="page = p"
          >
            {{ p }}
          </button>
          <button
            :disabled="page >= totalPages"
            class="flex size-9 items-center justify-center rounded-xl ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40 dark:ring-slate-700 dark:hover:bg-slate-800"
            @click="page++"
          >
            <UIcon name="i-lucide-chevron-right" class="size-4 text-slate-500" />
          </button>
        </div>
      </div>
    </template>

    <!-- ─── Detail slideover ───────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-8"
      leave-active-class="transition-all duration-200 ease-in"
      leave-to-class="opacity-0 translate-x-8"
    >
      <div
        v-if="isDetailOpen && selected"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-slate-900"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/[0.06]">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1" :class="levelColor(selected.level)">
              {{ selected.level }}
            </span>
            <span class="font-mono text-sm text-slate-600 dark:text-slate-300">{{ formatTime(selected.time) }}</span>
          </div>
          <button
            class="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            @click="isDetailOpen = false"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 space-y-4 overflow-y-auto p-5">
          <!-- Meta chips -->
          <div class="flex flex-wrap gap-2">
            <template v-for="[k, v] in [['txid', selected.txid], ['endpoint', selected.endpoint], ['method', selected.method], ['result_code', selected.result_code], ['elapsed', selected.elapsed_time != null ? `${selected.elapsed_time}ms` : undefined]]" :key="k">
              <div v-if="v != null" class="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{{ k }}</span>
                <span class="font-mono text-xs text-slate-700 dark:text-slate-200">{{ v }}</span>
              </div>
            </template>
          </div>

          <!-- Message -->
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">msg</p>
            <p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ selected.msg }}</p>
          </div>

          <!-- Request -->
          <div v-if="selected.step_request" class="space-y-1.5">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.detail.request') }}</p>
            <pre class="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-emerald-400">{{ tryPrettyJson(selected.step_request) }}</pre>
          </div>

          <!-- Response -->
          <div v-if="selected.step_response" class="space-y-1.5">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ t('logs.detail.response') }}</p>
            <pre class="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-sky-400">{{ tryPrettyJson(selected.step_response) }}</pre>
          </div>

          <!-- Raw JSON -->
          <details class="group">
            <summary class="cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              {{ t('logs.detail.raw') }}
            </summary>
            <pre class="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-400">{{ JSON.stringify(selected, null, 2) }}</pre>
          </details>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-200" leave-to-class="opacity-0">
      <div
        v-if="isDetailOpen"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        @click="isDetailOpen = false"
      />
    </Transition>
  </div>
</template>
