<script setup lang="ts">
import { toast } from 'vue3-toastify'

const { t } = useI18n()

definePageMeta({ title: 'Export Data' })
useHead({ title: 'Export Data' })

const exportFormat = ref<'xlsx' | 'csv'>('xlsx')
const isExporting = ref(false)
const exportProgress = ref(0)

const formatLabel = computed(() => exportFormat.value === 'xlsx' ? 'Excel (.xlsx)' : 'CSV')

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
</script>

<template>
  <div class="space-y-6">
    <!-- ─── Page identity banner ──────────────────────── -->
    <div class="relative overflow-hidden rounded-2xl border border-red-200/60 bg-white shadow-sm dark:border-red-500/[0.14] dark:bg-slate-900">
      <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
      <div class="flex items-start gap-4 px-5 pb-5 pt-5">
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 shadow-lg shadow-red-600/30">
          <UIcon name="i-lucide-file-down" class="size-7 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {{ t('export.title') }}
            </h1>
            <span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold tracking-wide text-red-700 dark:bg-red-500/15 dark:text-red-300">ALL DATA</span>
          </div>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ t('export.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- ─── Format selector ───────────────────────────── -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
      <div class="border-b border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <div class="flex items-center gap-2.5">
          <div class="flex size-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
            <UIcon name="i-lucide-file-type-2" class="size-4 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="font-semibold text-slate-900 dark:text-white">{{ t('export.format') }}</h3>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 p-5">
        <!-- Excel option -->
        <button
          class="group relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all duration-200"
          :class="exportFormat === 'xlsx'
            ? 'border-red-600 bg-red-50/60 dark:border-red-500 dark:bg-red-500/[0.07]'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]'"
          @click="exportFormat = 'xlsx'"
        >
          <div
            class="flex size-12 items-center justify-center rounded-xl transition-colors"
            :class="exportFormat === 'xlsx' ? 'bg-red-100 dark:bg-red-500/20' : 'bg-slate-100 dark:bg-white/[0.05]'"
          >
            <UIcon
              name="i-lucide-file-spreadsheet"
              class="size-6 transition-colors"
              :class="exportFormat === 'xlsx' ? 'text-red-600 dark:text-red-400' : 'text-slate-400'"
            />
          </div>
          <div>
            <p class="font-semibold text-slate-900 dark:text-white">{{ t('export.formatExcel') }}</p>
            <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{{ t('export.formatExcelDesc') }}</p>
          </div>
          <div
            v-if="exportFormat === 'xlsx'"
            class="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-red-600 dark:bg-red-500"
          >
            <UIcon name="i-lucide-check" class="size-3 text-white" />
          </div>
        </button>

        <!-- CSV option -->
        <button
          class="group relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all duration-200"
          :class="exportFormat === 'csv'
            ? 'border-red-600 bg-red-50/60 dark:border-red-500 dark:bg-red-500/[0.07]'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15]'"
          @click="exportFormat = 'csv'"
        >
          <div
            class="flex size-12 items-center justify-center rounded-xl transition-colors"
            :class="exportFormat === 'csv' ? 'bg-red-100 dark:bg-red-500/20' : 'bg-slate-100 dark:bg-white/[0.05]'"
          >
            <UIcon
              name="i-lucide-file-text"
              class="size-6 transition-colors"
              :class="exportFormat === 'csv' ? 'text-red-600 dark:text-red-400' : 'text-slate-400'"
            />
          </div>
          <div>
            <p class="font-semibold text-slate-900 dark:text-white">{{ t('export.formatCsv') }}</p>
            <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{{ t('export.formatCsvDesc') }}</p>
          </div>
          <div
            v-if="exportFormat === 'csv'"
            class="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-red-600 dark:bg-red-500"
          >
            <UIcon name="i-lucide-check" class="size-3 text-white" />
          </div>
        </button>
      </div>
    </div>

    <!-- ─── Export action card ────────────────────────── -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900">
      <div class="flex items-center justify-between gap-4 px-5 py-5">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05]">
            <UIcon name="i-lucide-database" class="size-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p class="font-semibold text-slate-900 dark:text-white">{{ t('export.exportAll') }}</p>
            <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {{ t('export.exportAllDesc', { format: formatLabel }) }}
            </p>
          </div>
        </div>
        <Button :disabled="isExporting" class="shrink-0" @click="startExport">
          <UIcon v-if="isExporting" name="i-lucide-loader-2" class="mr-2 size-4 animate-spin" />
          <UIcon v-else name="i-lucide-download" class="mr-2 size-4" />
          {{ t('export.start') }}
        </Button>
      </div>

      <!-- Progress bar -->
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
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {{ t('export.generating', { format: formatLabel }) }}
                </p>
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
  </div>
</template>
