<script setup lang="ts">
defineEmits(['close'])
const route = useRoute()

type NavItem = {
  key: string
  label: string
  icon: string
  to: string
  visible?: boolean
}

const navigation = computed((): NavItem[] => [
  {
    key: 'prebooking',
    label: 'Pre Booking',
    icon: 'i-lucide-bar-chart-2',
    to: '/prebooking',
    visible: true,
  },
  {
    key: 'branch',
    label: 'Branch Management',
    icon: 'i-lucide-shopping-bag',
    to: '/branch',
    visible: true,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/settings',
    visible: true,
  },
])

const visibleNav = computed(() => navigation.value.filter(i => i.visible))

const isActive = (path: string) => route.path.startsWith(path)
</script>

<template>
  <aside class="flex h-full w-[218px] flex-col bg-white border-r border-[#E5E5E5]">
    <!-- ─── Logo / Brand ─────────────────────────────────── -->
    <div class="flex items-center gap-3 px-5 py-6">
      <!-- Logo SVG -->
      <img src="~/assets/icon/Subtract.svg" alt="Pre Booking" class="size-[42px] shrink-0" >
      <!-- App name -->
      <span class="whitespace-nowrap text-2xl font-bold text-[#030229]" style="font-family: 'Nunito', sans-serif;">Pre Booking</span>
      <!-- Mobile close button -->
      <button
        class="ml-auto flex size-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden"
        @click="$emit('close')"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </div>

    <!-- ─── Navigation ────────────────────────────────────── -->
    <nav class="flex-1 space-y-1 px-4 pb-4">
      <NuxtLink
        v-for="item in visibleNav"
        :key="item.key"
        :to="item.to"
        class="relative flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200"
        :class="[
          isActive(item.to)
            ? 'bg-[rgba(96,91,255,0.08)]'
            : 'hover:bg-gray-50',
        ]"
        @click="$emit('close')"
      >
        <!-- Left accent bar (active) -->
        <div
          v-if="isActive(item.to)"
          class="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-gradient-to-b from-[#ACA9FF] to-[#605BFF]"
        />

        <!-- Icon -->
        <UIcon
          :name="item.icon"
          class="size-5 shrink-0 transition-colors"
          :class="isActive(item.to) ? 'text-[#605BFF]' : 'text-[#999999]'"
        />

        <!-- Label -->
        <span
          class="text-base font-semibold transition-colors"
          :class="isActive(item.to) ? 'text-[#605BFF]' : 'text-[#030229]/50'"
          style="font-family: 'Nunito', sans-serif;"
        >
          {{ item.label }}
        </span>
      </NuxtLink>
    </nav>

    <!-- ─── User profile ───────────────────────────────────── -->
    <div class="border-t border-[#E5E5E5] px-5 py-4">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div class="flex size-[45px] shrink-0 items-center justify-center rounded-xl bg-[#FFC7D4] overflow-hidden">
          <UIcon name="i-lucide-user" class="size-5 text-[#200E32]" />
        </div>
        <!-- Name / Role -->
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-[#030229] truncate">Name Surname</p>
          <p class="text-[10px] text-[#030229]/50 truncate">Role......</p>
        </div>
        <!-- Logout icon -->
        <button class="flex size-7 shrink-0 items-center justify-center rounded-lg text-gray-400/40 transition-colors hover:bg-gray-100 hover:text-gray-500">
          <UIcon name="i-lucide-log-out" class="size-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
