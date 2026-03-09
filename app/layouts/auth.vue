<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen">
    <!-- ─── Left branding panel (desktop only) ────────── -->
    <div class="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-[#1A0505] p-12 lg:flex">
      <!-- Deep gradient mesh -->
      <div class="absolute inset-0 bg-gradient-to-br from-red-950/80 via-[#1A0505] to-rose-950/60" />

      <!-- Dot grid pattern -->
      <div
        class="absolute inset-0 opacity-[0.15]"
        style="background-image: radial-gradient(circle at 1.5px 1.5px, rgba(224,0,0,0.5) 1.5px, transparent 0); background-size: 30px 30px;"
      />

      <!-- Radial glow blobs -->
      <div class="absolute -bottom-40 -left-20 size-[500px] rounded-full bg-red-600/15 blur-3xl" />
      <div class="absolute -top-20 right-10 size-80 rounded-full bg-rose-500/10 blur-3xl" />
      <div class="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/8 blur-2xl" />

      <!-- Top logo -->
      <div class="relative flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm shadow-lg shadow-black/20">
          <UIcon name="i-lucide-smartphone" class="size-5 text-white" />
        </div>
        <div>
          <p class="text-base font-bold text-white leading-none">Prebooking</p>
          <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300/70">Back Office System</p>
        </div>
      </div>

      <!-- Center hero content -->
      <div class="relative space-y-7">
        <!-- System status pill -->
        <div class="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 backdrop-blur-sm">
          <span class="relative flex size-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span class="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span class="text-xs font-medium text-emerald-400">ระบบพร้อมใช้งาน</span>
        </div>

        <!-- Headline -->
        <div class="space-y-2">
          <h2 class="text-3xl font-bold leading-tight tracking-tight text-white">
            จัดการ Prebooking<br>
            <span class="bg-gradient-to-r from-red-300 to-rose-400 bg-clip-text text-transparent">ได้อย่างมีประสิทธิภาพ</span>
          </h2>
          <p class="text-sm leading-relaxed text-slate-400">
            ระบบ Back Office สำหรับจัดการข้อมูลการจองมือถือ<br>พร้อมนำเข้า-ส่งออกข้อมูล Excel
          </p>
        </div>

        <!-- Feature list -->
        <div class="space-y-3">
          <div
            v-for="feature in [
              { text: 'นำเข้าข้อมูลได้สูงสุด 100,000 แถว', icon: 'i-lucide-database' },
              { text: 'ติดตามสถานะการจองแบบ Real-time', icon: 'i-lucide-activity' },
              { text: 'ส่งออก Report ได้ทันที', icon: 'i-lucide-file-down' },
            ]"
            :key="feature.text"
            class="flex items-center gap-3"
          >
            <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-500/15 ring-1 ring-red-500/20">
              <UIcon :name="feature.icon" class="size-3.5 text-red-400" />
            </div>
            <p class="text-sm text-slate-300">{{ feature.text }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="relative">
        <p class="text-xs text-slate-600">© 2026 Prebooking Back Office · สงวนสิทธิ์ทุกประการ</p>
      </div>
    </div>

    <!-- ─── Right form area ───────────────────────────── -->
    <div class="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12 dark:bg-[#070C19]">
      <div class="w-full max-w-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
