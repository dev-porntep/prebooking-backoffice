<script setup lang="ts">
const { t } = useI18n()
const colorMode = useColorMode()
const emit = defineEmits(['toggle-sidebar'])

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Mock user — จะเปลี่ยนเป็น useUserSession() ตอนต่อ SSO จริง
const user = ref({
  name: 'Admin User',
  email: 'admin@company.com',
  avatar: '',
})

const initials = computed(() => {
  return user.value.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const userMenuItems = computed(() => [
  [
    { label: t('user.profile'), icon: 'i-lucide-user' },
    { label: t('user.settings'), icon: 'i-lucide-settings' },
  ],
  [
    { label: t('user.logout'), icon: 'i-lucide-log-out', click: () => navigateTo('/login') },
  ],
])

const pageTitleMap = computed((): Record<string, { title: string; subtitle: string }> => ({
  '/display': { title: t('pages.display.title'), subtitle: t('pages.display.subtitle') },
  '/import': { title: t('pages.import.title'), subtitle: t('pages.import.subtitle') },
  '/export': { title: t('pages.export.title'), subtitle: t('pages.export.subtitle') },
}))

const route = useRoute()
const pageInfo = computed(() => pageTitleMap.value[route.path] ?? { title: String(route.meta['title'] ?? 'Dashboard'), subtitle: '' })
</script>

<template>
  <header class="relative z-10 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-md dark:border-white/[0.05] dark:bg-[#090E1C]/80 sm:px-6">
    <!-- Mobile menu hamburger -->
    <button
      class="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white lg:hidden"
      @click="emit('toggle-sidebar')"
    >
      <UIcon name="i-lucide-menu" class="size-5" />
    </button>

    <!-- Page title (left) -->
    <div class="min-w-0 flex-1">
      <h2 class="truncate text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">
        {{ pageInfo.title }}
      </h2>
      <p v-if="pageInfo.subtitle" class="mt-0.5 truncate text-[11px] leading-none text-slate-400 dark:text-slate-500">
        {{ pageInfo.subtitle }}
      </p>
    </div>

    <!-- Right-side actions -->
    <div class="flex items-center gap-1.5">
      <!-- Language switcher -->
      <LayoutLanguageSwitcher />

      <!-- Dark mode toggle (ClientOnly prevents SSR/client hydration mismatch) -->
      <ClientOnly>
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          @click="toggleColorMode"
        />
        <template #fallback>
          <div class="size-8" />
        </template>
      </ClientOnly>

      <!-- Notifications -->
      <div class="relative">
        <UButton
          icon="i-lucide-bell"
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        />
        <span class="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#090E1C]" />
      </div>

      <!-- Divider -->
      <div class="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />

      <!-- User dropdown -->
      <UDropdownMenu :items="userMenuItems">
        <button class="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-slate-100 dark:hover:bg-white/[0.05] ring-1 ring-transparent hover:ring-slate-200 dark:hover:ring-white/[0.08]">
          <!-- Avatar gradient -->
          <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-[11px] font-bold text-white shadow-md shadow-red-600/25">
            {{ initials }}
          </div>
          <!-- Name + email (hidden on xs) -->
          <div class="hidden text-left sm:block">
            <p class="text-xs font-medium leading-none text-slate-900 dark:text-slate-100">{{ user.name }}</p>
            <p class="mt-0.5 text-[10px] leading-none text-slate-400 dark:text-slate-500">{{ user.email }}</p>
          </div>
          <UIcon name="i-lucide-chevron-down" class="hidden size-3 text-slate-400 sm:block" />
        </button>
      </UDropdownMenu>
    </div>
  </header>
</template>
