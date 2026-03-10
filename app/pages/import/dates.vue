<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ title: 'Booking Dates' })
useHead({ title: t('nav.import.dates.label') })
</script>

<template>
  <div class="space-y-6 p-6">
    <div>
      <h1 class="text-xl font-semibold text-slate-900 dark:text-white">
        {{ t('nav.import.dates.label') }}
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ t('nav.import.dates.sublabel') }}
      </p>
    </div>

    <div class="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-24 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div class="text-center">
        <UIcon name="i-lucide-calendar-days" class="mx-auto mb-3 size-10 text-slate-300 dark:text-slate-600" />
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Coming soon</p>
        <p class="mt-1 text-xs text-slate-400 dark:text-slate-600">ฟีเจอร์นี้กำลังพัฒนา</p>
      </div>
    </div>
  </div>
</template>
