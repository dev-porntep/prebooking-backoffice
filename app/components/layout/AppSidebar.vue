<script setup lang="ts">
const route = useRoute()

defineEmits(['close'])

const navigation = [
  {
    label: 'Dashboard',
    sublabel: 'ดูข้อมูล Prebooking',
    icon: 'i-lucide-layout-dashboard',
    to: '/display',
  },
  {
    label: 'Import Excel',
    sublabel: 'นำเข้าข้อมูล',
    icon: 'i-lucide-upload',
    to: '/import',
  },
  {
    label: 'Export Excel',
    sublabel: 'ส่งออกข้อมูล',
    icon: 'i-lucide-download',
    to: '/export',
  },
]

const isActive = (path: string) => route.path === path
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
          <p class="text-sm font-bold tracking-wide text-white leading-none">Prebooking</p>
          <p class="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-red-200/70 leading-none">Back Office</p>
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
      <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">เมนูหลัก</p>
    </div>

    <!-- ─── Navigation ────────────────────────────────────── -->
    <nav class="flex-1 space-y-0.5 px-3 pb-4">
      <NuxtLink
        v-for="item in navigation"
        :key="item.to"
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
    </nav>

    <!-- ─── Bottom status ─────────────────────────────────── -->
    <div class="border-t border-white/[0.06] px-5 py-4">
      <div class="flex items-center gap-2.5">
        <span class="relative flex size-2 shrink-0">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span class="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <p class="text-[11px] text-slate-500">ระบบออนไลน์ · v1.0.0</p>
      </div>
    </div>
  </aside>
</template>
