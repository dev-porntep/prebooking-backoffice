<script setup lang="ts">
defineProps<{ desktopCollapsed?: boolean }>()
const emit = defineEmits(['toggle-sidebar', 'toggle-desktop-sidebar'])
const { t } = useI18n()
const colorMode = useColorMode()
// จัดการสถานะการเลือกธีม (เก็บใน Cookie)
const themeSetting = useCookie<'light' | 'dark' | 'auto'>('theme-setting', { default: () => 'light' })

// ฟังก์ชันอัปเดตธีม (Theme) อัตโนมัติตามเวลาประเทศไทย
const updateThemeBasedOnThaiTime = () => {
  if (themeSetting.value !== 'auto') return
  
  const now = new Date()
  const utcHours = now.getUTCHours()
  const thaiHours = (utcHours + 7) % 24
  
  // กลางวัน: 06:00 - 17:59, กลางคืน: 18:00 - 05:59
  const isDayTime = thaiHours >= 6 && thaiHours < 18
  colorMode.preference = isDayTime ? 'light' : 'dark'
}

let timeInterval: ReturnType<typeof setInterval>

onMounted(() => {
  // ทำงานครั้งแรกเมื่อ Component โหลดเสร็จบน Client (Client-side)
  if (themeSetting.value === 'auto') {
    updateThemeBasedOnThaiTime()
  } else {
    colorMode.preference = themeSetting.value
  }
  
  // ตั้งค่า Timer เช็คเวลาทุกๆ 5 นาที
  timeInterval = setInterval(updateThemeBasedOnThaiTime, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})

watch(themeSetting, (newValue) => {
  if (newValue === 'auto') {
    updateThemeBasedOnThaiTime()
  } else {
    colorMode.preference = newValue
  }
})

const themeIcon = computed(() => {
  if (themeSetting.value === 'light') return 'i-lucide-sun'
  if (themeSetting.value === 'dark') return 'i-lucide-moon'
  return 'i-lucide-clock' // ไอคอนสำหรับโหมดอิงเวลา
})

const { user: sessionUser } = useUserSession()
const user = computed(() => ({
  name: (sessionUser.value as { name?: string } | null)?.name ?? 'User',
  email: (sessionUser.value as { email?: string } | null)?.email ?? '',
}))

const initials = computed(() => {
  return user.value.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const userMenuItems = computed(() => [
  { label: t('user.logout'), icon: 'i-lucide-log-out', click: () => navigateTo('/auth/logout', { external: true }) },
])

const pageTitleMap = computed((): Record<string, { title: string; subtitle: string }> => ({
  '/': { title: t('pages.home.title'), subtitle: t('pages.home.subtitle') },
  '/import/quota': { title: t('import.quota.title'), subtitle: t('import.quota.subtitle') },
  '/import/dates': { title: t('import.dates.title'), subtitle: t('import.dates.subtitle') },
  '/import/timeslots': { title: t('import.timeslots.title'), subtitle: t('import.timeslots.subtitle') },
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

    <!-- Desktop sidebar toggle -->
    <button
      class="hidden size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white lg:flex"
      @click="emit('toggle-desktop-sidebar')"
    >
      <UIcon :name="desktopCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'" class="size-5" />
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
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="sm"
              class="size-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <UIcon :name="themeIcon" class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="themeSetting = 'light'">
              <UIcon name="i-lucide-sun" class="mr-2 size-4" />
              <span>สว่าง (Light)</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="themeSetting = 'dark'">
              <UIcon name="i-lucide-moon" class="mr-2 size-4" />
              <span>มืด (Dark)</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="themeSetting = 'auto'">
              <UIcon name="i-lucide-clock" class="mr-2 size-4" />
              <span>อัตโนมัติ (Thai Time)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <template #fallback>
          <div class="size-8" />
        </template>
      </ClientOnly>

      <!-- Notifications -->
      <div class="relative">
        <Button
          variant="ghost"
          size="sm"
          class="size-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <UIcon name="i-lucide-bell" class="size-4" />
        </Button>
        <span class="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#090E1C]" />
      </div>

      <!-- Divider -->
      <div class="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />

      <!-- User dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button class="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-slate-100 dark:hover:bg-white/[0.05] ring-1 ring-transparent hover:ring-slate-200 dark:hover:ring-white/[0.08] focus:outline-none">
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
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem v-for="item in userMenuItems" :key="item.label" @click="item.click()">
            <UIcon :name="item.icon" class="mr-2 size-4 text-red-500" />
            <span class="text-red-500">{{ item.label }}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
