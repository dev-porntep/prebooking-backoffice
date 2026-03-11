<script setup lang="ts">
defineEmits(['close'])
const { t } = useI18n()
const route = useRoute()

type NavChild = { label: string; sublabel: string; icon: string; to: string }
type NavItem =
  | { label: string; sublabel: string; icon: string; to: string; children?: never }
  | { label: string; sublabel: string; icon: string; to?: never; children: NavChild[] }

const navigation = computed((): NavItem[] => [
  // TODO: เปิดใช้เมื่อ Dashboard พร้อม
  // {
  //   label: t('nav.dashboard.label'),
  //   sublabel: t('nav.dashboard.sublabel'),
  //   icon: 'i-lucide-layout-dashboard',
  //   to: '/',
  // },
  {
    label: t('nav.import.label'),
    sublabel: t('nav.import.sublabel'),
    icon: 'i-lucide-upload',
    children: [
      {
        label: t('nav.import.quota.label'),
        sublabel: t('nav.import.quota.sublabel'),
        icon: 'i-lucide-package',
        to: '/import/quota',
      },
      {
        label: t('nav.import.dates.label'),
        sublabel: t('nav.import.dates.sublabel'),
        icon: 'i-lucide-calendar-days',
        to: '/import/dates',
      },
      {
        label: t('nav.import.timeslots.label'),
        sublabel: t('nav.import.timeslots.sublabel'),
        icon: 'i-lucide-clock',
        to: '/import/timeslots',
      },
    ],
  },
  {
    label: t('nav.export.label'),
    sublabel: t('nav.export.sublabel'),
    icon: 'i-lucide-download',
    to: '/export',
  },
  {
    label: t('nav.logs.label'),
    sublabel: t('nav.logs.sublabel'),
    icon: 'i-lucide-file-text',
    to: '/logs',
  },
])

const isActive = (path: string) => route.path === path

const isChildActive = (children: NavChild[]) =>
  children.some(c => route.path === c.to)

// Auto-open import group if currently on an import child route
const openGroups = ref<Set<string>>(new Set(
  route.path.startsWith('/import') ? ['import'] : []
))

const toggleGroup = (key: string) => {
  const next = new Set(openGroups.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  openGroups.value = next
}

const isGroupOpen = (key: string) => openGroups.value.has(key)
</script>

<template>
  <aside class="flex h-full w-64 flex-col bg-slate-900 dark:bg-[#0C1220] shadow-2xl shadow-black/30">
    <!-- ─── Logo / Brand ─────────────────────────────────── -->
    <div class="relative overflow-hidden">
      <!-- Gradient mesh background -->
      <div class="absolute inset-0 bg-gradient-to-br from-red-600 via-rose-700 to-rose-800" />
      <div
        class="absolute inset-0 opacity-25"
        style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 22px 22px;"
      />
      <!-- Bottom glow line -->
      <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div class="relative flex h-16 items-center gap-3 px-4">
        <!-- Icon -->
        <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 shadow-lg shadow-black/20 backdrop-blur-sm">
          <UIcon name="i-lucide-smartphone" class="size-[18px] text-white" />
        </div>
        <!-- Title -->
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold tracking-wide text-white leading-none">{{ $t('app.name') }}</p>
          <p class="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-red-200/70 leading-none">{{ $t('app.subtitle') }}</p>
        </div>
        <!-- Mobile close button -->
        <button
          class="flex size-7 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          @click="$emit('close')"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </button>
      </div>
    </div>

    <!-- ─── Nav label ─────────────────────────────────────── -->
    <div class="px-4 pb-1.5 pt-5">
      <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{{ $t('nav.menu') }}</p>
    </div>

    <!-- ─── Navigation ────────────────────────────────────── -->
    <nav class="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
      <template v-for="item in navigation" :key="item.label">
        <!-- ── Group (has children) ── -->
        <template v-if="item.children">
          <button
            class="group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
            :class="[
              isChildActive(item.children)
                ? 'bg-red-500/[0.12] ring-1 ring-red-500/25 shadow-sm'
                : 'ring-1 ring-transparent hover:bg-white/[0.04] hover:ring-white/[0.07]',
            ]"
            @click="toggleGroup('import')"
          >
            <!-- Active left bar -->
            <div
              v-if="isChildActive(item.children)"
              class="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-red-400"
              style="box-shadow: 0 0 8px 1px rgba(224,0,0,0.6)"
            />

            <!-- Icon bubble -->
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200"
              :class="[
                isChildActive(item.children)
                  ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-600/30'
                  : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700/80 group-hover:text-slate-300',
              ]"
            >
              <UIcon :name="item.icon" class="size-4" />
            </div>

            <!-- Labels -->
            <div class="min-w-0 flex-1 text-left">
              <p
                class="text-sm font-medium leading-none transition-colors"
                :class="isChildActive(item.children) ? 'text-red-300' : 'text-slate-300 group-hover:text-white'"
              >
                {{ item.label }}
              </p>
              <p
                class="mt-0.5 truncate text-[11px] leading-none transition-colors"
                :class="isChildActive(item.children) ? 'text-red-400/60' : 'text-slate-600 group-hover:text-slate-400'"
              >
                {{ item.sublabel }}
              </p>
            </div>

            <!-- Chevron -->
            <UIcon
              name="i-lucide-chevron-right"
              class="size-3.5 shrink-0 text-slate-500 transition-transform duration-200"
              :class="isGroupOpen('import') ? 'rotate-90 text-slate-400' : ''"
            />
          </button>

          <!-- Children -->
          <div
            v-show="isGroupOpen('import')"
            class="ml-3 mt-0.5 space-y-0.5 border-l border-white/[0.06] pl-3"
          >
            <NuxtLink
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              class="group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-200"
              :class="[
                isActive(child.to)
                  ? 'bg-red-500/[0.10] ring-1 ring-red-500/20'
                  : 'ring-1 ring-transparent hover:bg-white/[0.04] hover:ring-white/[0.06]',
              ]"
              @click="$emit('close')"
            >
              <!-- Icon -->
              <div
                class="flex size-6 shrink-0 items-center justify-center rounded-md transition-all duration-200"
                :class="[
                  isActive(child.to)
                    ? 'bg-red-600/80 text-white'
                    : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700/80 group-hover:text-slate-300',
                ]"
              >
                <UIcon :name="child.icon" class="size-3.5" />
              </div>

              <!-- Labels -->
              <div class="min-w-0 flex-1">
                <p
                  class="text-xs font-medium leading-none transition-colors"
                  :class="isActive(child.to) ? 'text-red-300' : 'text-slate-400 group-hover:text-white'"
                >
                  {{ child.label }}
                </p>
                <p
                  class="mt-0.5 truncate text-[10px] leading-none transition-colors"
                  :class="isActive(child.to) ? 'text-red-400/50' : 'text-slate-600 group-hover:text-slate-500'"
                >
                  {{ child.sublabel }}
                </p>
              </div>

              <!-- Active dot -->
              <div
                v-if="isActive(child.to)"
                class="size-1 shrink-0 rounded-full bg-red-400"
                style="box-shadow: 0 0 5px 1px rgba(224,0,0,0.5)"
              />
            </NuxtLink>
          </div>
        </template>

        <!-- ── Leaf item (no children) ── -->
        <NuxtLink
          v-else
          :to="item.to"
          class="group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
          :class="[
            isActive(item.to)
              ? 'bg-red-500/[0.12] ring-1 ring-red-500/25 shadow-sm'
              : 'ring-1 ring-transparent hover:bg-white/[0.04] hover:ring-white/[0.07]',
          ]"
          @click="$emit('close')"
        >
          <!-- Active left bar -->
          <div
            v-if="isActive(item.to)"
            class="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-red-400"
            style="box-shadow: 0 0 8px 1px rgba(224,0,0,0.6)"
          />

          <!-- Icon bubble -->
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200"
            :class="[
              isActive(item.to)
                ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-600/30'
                : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700/80 group-hover:text-slate-300',
            ]"
          >
            <UIcon :name="item.icon" class="size-4" />
          </div>

          <!-- Labels -->
          <div class="min-w-0 flex-1">
            <p
              class="text-sm font-medium leading-none transition-colors"
              :class="isActive(item.to) ? 'text-red-300' : 'text-slate-300 group-hover:text-white'"
            >
              {{ item.label }}
            </p>
            <p
              class="mt-0.5 truncate text-[11px] leading-none transition-colors"
              :class="isActive(item.to) ? 'text-red-400/60' : 'text-slate-600 group-hover:text-slate-400'"
            >
              {{ item.sublabel }}
            </p>
          </div>

          <!-- Active glow dot -->
          <div
            v-if="isActive(item.to)"
            class="size-1.5 shrink-0 rounded-full bg-red-400"
            style="box-shadow: 0 0 7px 2px rgba(224,0,0,0.5)"
          />
        </NuxtLink>
      </template>
    </nav>

    <!-- ─── Bottom status ─────────────────────────────────── -->
    <div class="border-t border-white/[0.06] px-5 py-4">
      <div class="flex items-center gap-2.5">
        <span class="relative flex size-2 shrink-0">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span class="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <p class="text-[11px] text-slate-500">{{ $t('system.online') }} · v1.0.0</p>
      </div>
    </div>
  </aside>
</template>
