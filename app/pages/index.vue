<script setup lang="ts">
const { t, locale } = useI18n()

definePageMeta({ title: 'Home' })
useHead({ title: 'Prebooking Back Office' })

const { user: sessionUser } = useUserSession()
const userName = computed(() => (sessionUser.value as { name?: string } | null)?.name ?? 'Admin')

const today = computed(() =>
  new Date().toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

const quickActions = computed(() => [
  {
    title: t('home.actions.quota.title'),
    desc: t('home.actions.quota.desc'),
    icon: 'i-lucide-package',
    to: '/import/quota',
    from: 'from-red-500',
    to_color: 'to-rose-600',
    glow: 'shadow-red-500/20',
    ring: 'ring-red-500/20',
    badge: 'bg-red-500/10 text-red-400',
    tag: t('home.actions.quota.tag'),
  },
  {
    title: t('home.actions.dates.title'),
    desc: t('home.actions.dates.desc'),
    icon: 'i-lucide-calendar-days',
    to: '/import/dates',
    from: 'from-sky-500',
    to_color: 'to-blue-600',
    glow: 'shadow-sky-500/20',
    ring: 'ring-sky-500/20',
    badge: 'bg-sky-500/10 text-sky-400',
    tag: t('home.actions.dates.tag'),
  },
  {
    title: t('home.actions.timeslots.title'),
    desc: t('home.actions.timeslots.desc'),
    icon: 'i-lucide-clock',
    to: '/import/timeslots',
    from: 'from-violet-500',
    to_color: 'to-purple-600',
    glow: 'shadow-violet-500/20',
    ring: 'ring-violet-500/20',
    badge: 'bg-violet-500/10 text-violet-400',
    tag: t('home.actions.timeslots.tag'),
  },
  {
    title: t('home.actions.export.title'),
    desc: t('home.actions.export.desc'),
    icon: 'i-lucide-download',
    to: '/export',
    from: 'from-emerald-500',
    to_color: 'to-teal-600',
    glow: 'shadow-emerald-500/20',
    ring: 'ring-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-400',
    tag: t('home.actions.export.tag'),
  },
])

const capabilities = computed(() => [
  {
    icon: 'i-lucide-package',
    title: t('home.capabilities.quota.title'),
    desc: t('home.capabilities.quota.desc'),
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },
  {
    icon: 'i-lucide-calendar-days',
    title: t('home.capabilities.dates.title'),
    desc: t('home.capabilities.dates.desc'),
    color: 'text-sky-500 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
  },
  {
    icon: 'i-lucide-clock',
    title: t('home.capabilities.timeslots.title'),
    desc: t('home.capabilities.timeslots.desc'),
    color: 'text-violet-500 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
  },
  {
    icon: 'i-lucide-file-spreadsheet',
    title: t('home.capabilities.export.title'),
    desc: t('home.capabilities.export.desc'),
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
])

const limitations = computed(() => [
  { icon: 'i-lucide-hard-drive', label: t('home.limitations.fileSize.label'), value: t('home.limitations.fileSize.value') },
  { icon: 'i-lucide-rows', label: t('home.limitations.rows.label'), value: t('home.limitations.rows.value') },
  { icon: 'i-lucide-layers', label: t('home.limitations.chunk.label'), value: t('home.limitations.chunk.value') },
  { icon: 'i-lucide-file-type', label: t('home.limitations.fileType.label'), value: t('home.limitations.fileType.value') },
  { icon: 'i-lucide-layout-dashboard', label: t('home.limitations.dashboard.label'), value: t('home.limitations.dashboard.value') },
  { icon: 'i-lucide-shield-check', label: t('home.limitations.auth.label'), value: t('home.limitations.auth.value') },
])

const techStack = [
  { label: 'nuxt-auth-utils', value: 'v0.5.29' },
  { label: 'Nuxt', value: '4' },
  { label: 'App Version', value: 'v1.0.0' },
]
</script>

<template>
  <div class="min-h-full space-y-8 p-6 lg:p-8">

    <!-- ─── Hero ──────────────────────────────────────────── -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-xl dark:from-[#0C1220] dark:via-[#101828] dark:to-[#0C1220]">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.06]"
        style="background-image: radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0); background-size: 28px 28px;"
      />
      <div class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-red-600/20 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-16 left-1/3 size-56 rounded-full bg-rose-700/10 blur-3xl" />

      <div class="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            {{ t('home.systemOnline') }}
          </div>

          <h1 class="text-3xl font-bold text-white">
            {{ t('home.greeting') }}, <span class="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">{{ userName }}</span>
          </h1>
          <p class="text-sm text-slate-400">{{ t('home.systemTitle') }}</p>
        </div>

        <div class="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3.5 backdrop-blur-sm">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{{ t('home.todayLabel') }}</p>
          <p class="mt-1 text-sm font-medium text-slate-200">{{ today }}</p>
        </div>
      </div>
    </div>

    <!-- ─── Quick Actions ─────────────────────────────────── -->
    <section class="space-y-4">
      <div class="flex items-center gap-2.5">
        <div class="h-px flex-1 bg-slate-200 dark:bg-white/[0.06]" />
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{{ t('home.quickActionsLabel') }}</p>
        <div class="h-px flex-1 bg-slate-200 dark:bg-white/[0.06]" />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          v-for="action in quickActions"
          :key="action.to"
          class="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/[0.06] dark:bg-slate-900"
          :class="'hover:' + action.glow + ' hover:ring-1 hover:' + action.ring"
          @click="navigateTo(action.to)"
        >
          <div :class="['h-0.5 w-full bg-gradient-to-r', action.from, action.to_color]" />

          <div class="p-5">
            <div class="flex items-start justify-between">
              <div :class="['flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', action.from, action.to_color]">
                <UIcon :name="action.icon" class="size-5" />
              </div>
              <span :class="['rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', action.badge]">
                {{ action.tag }}
              </span>
            </div>

            <div class="mt-4">
              <p class="font-semibold text-slate-900 dark:text-white">{{ action.title }}</p>
              <p class="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{{ action.desc }}</p>
            </div>

            <div class="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400 transition-all duration-200 group-hover:gap-2 group-hover:text-slate-600 dark:group-hover:text-slate-200">
              <span>{{ t('home.openPage') }}</span>
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </div>
          </div>
        </button>
      </div>
    </section>

    <!-- ─── Capabilities + Limitations ────────────────────── -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">

      <!-- Capabilities (2/3 width) -->
      <section class="space-y-4 lg:col-span-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="size-4 text-red-500" />
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">{{ t('home.capabilitiesTitle') }}</h2>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="cap in capabilities"
            :key="cap.title"
            class="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-white/[0.06] dark:bg-slate-900"
          >
            <div class="flex items-start gap-3">
              <div :class="['mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', cap.bg]">
                <UIcon :name="cap.icon" :class="['size-4', cap.color]" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ cap.title }}</p>
                <p class="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{{ cap.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Limitations (1/3 width) -->
      <section class="space-y-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-triangle-alert" class="size-4 text-amber-500" />
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">{{ t('home.limitationsTitle') }}</h2>
        </div>

        <div class="rounded-xl border border-amber-200/60 bg-amber-50/50 dark:border-amber-500/10 dark:bg-amber-500/5">
          <ul class="divide-y divide-amber-100 dark:divide-amber-500/10">
            <li
              v-for="limit in limitations"
              :key="limit.label"
              class="flex items-start gap-3 px-4 py-3"
            >
              <UIcon :name="limit.icon" class="mt-0.5 size-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ limit.label }}</p>
                <p class="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">{{ limit.value }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- ─── Tech Footer ────────────────────────────────────── -->
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200/60 pt-4 dark:border-white/[0.05]">
      <div
        v-for="tech in techStack"
        :key="tech.label"
        class="flex items-center gap-1.5"
      >
        <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ tech.label }}</span>
        <span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-600 dark:bg-white/[0.05] dark:text-slate-400">{{ tech.value }}</span>
      </div>
    </div>

  </div>
</template>
