<script setup lang="ts">
const { locale, setLocale } = useI18n()

const toggle = () => {
  setLocale(locale.value === 'th' ? 'en' : 'th')
}
</script>

<template>
  <ClientOnly>
    <button
      class="relative flex h-8 w-[4.5rem] items-center rounded-lg border border-slate-200/80 bg-slate-100/80 p-0.5 transition-all duration-300 hover:border-red-300/60 hover:shadow-sm dark:border-white/[0.08] dark:bg-white/[0.05] dark:hover:border-red-500/30"
      :aria-label="`Switch to ${locale === 'th' ? 'English' : 'Thai'}`"
      @click="toggle"
    >
      <!-- Sliding pill -->
      <span
        class="absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-md bg-white shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 dark:bg-slate-700 dark:ring-white/[0.1]"
        :class="locale === 'th' ? 'left-0.5' : 'left-[calc(50%+1px)]'"
      />

      <!-- TH label -->
      <span
        class="relative z-10 flex-1 text-center text-[11px] font-bold tracking-wide transition-colors duration-200"
        :class="locale === 'th' ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'"
      >
        TH
      </span>

      <!-- EN label -->
      <span
        class="relative z-10 flex-1 text-center text-[11px] font-bold tracking-wide transition-colors duration-200"
        :class="locale === 'en' ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'"
      >
        EN
      </span>
    </button>
    <template #fallback>
      <div class="h-8 w-[4.5rem]" />
    </template>
  </ClientOnly>
</template>
