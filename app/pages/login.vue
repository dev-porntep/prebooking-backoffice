<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'Login',
})

useHead({ title: 'Login' })

const isLoading = ref(false)

const handleSSOLogin = async () => {
  isLoading.value = true
  try {
    await navigateTo('/api/auth/sso', { external: true })
  } catch {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- ─── Mobile logo (hidden on desktop) ───────────── -->
    <div class="flex items-center gap-3 lg:hidden">
      <div class="flex size-9 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/30">
        <UIcon name="i-lucide-smartphone" class="size-5 text-white" />
      </div>
      <div>
        <p class="font-bold text-slate-900 dark:text-white leading-none">Prebooking</p>
        <p class="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">Back Office</p>
      </div>
    </div>

    <!-- ─── Heading ────────────────────────────────────── -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">เข้าสู่ระบบ</h1>
      <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        ใช้บัญชี SSO ขององค์กรเพื่อเข้าสู่ระบบ
      </p>
    </div>

    <!-- ─── SSO Button ─────────────────────────────────── -->
    <div class="space-y-4">
      <button
        class="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-br from-red-600 to-rose-700 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all duration-200 hover:shadow-red-600/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        :disabled="isLoading"
        @click="handleSSOLogin"
      >
        <!-- Shimmer sweep -->
        <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <span v-if="isLoading" class="relative flex items-center gap-2">
          <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
          กำลังเข้าสู่ระบบ...
        </span>
        <span v-else class="relative flex items-center gap-2">
          <UIcon name="i-lucide-shield-check" class="size-4" />
          เข้าสู่ระบบด้วย SSO
        </span>
      </button>

      <!-- Divider -->
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span class="text-xs text-slate-400">หรือ</span>
        <div class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <!-- Support info card -->
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <div class="flex gap-3">
          <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
            <UIcon name="i-lucide-headphones" class="size-4 text-amber-500" />
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-900 dark:text-white">ต้องการความช่วยเหลือ?</p>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              ติดต่อ IT Support หากมีปัญหาในการเข้าสู่ระบบ
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Footer note ────────────────────────────────── -->
    <p class="text-center text-xs text-slate-400">
      ระบบนี้สำหรับพนักงานที่ได้รับอนุญาตเท่านั้น
    </p>
  </div>
</template>
