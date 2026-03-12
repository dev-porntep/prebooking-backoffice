<script setup lang="ts">
defineEmits(['toggle-sidebar'])

const { user: sessionUser } = useUserSession()
const _userName = computed(() => (sessionUser.value as { name?: string } | null)?.name ?? 'User')
</script>

<template>
  <!-- Header only visible on mobile as a slim top bar -->
  <header class="flex h-14 shrink-0 items-center gap-3 border-b border-[#E5E5E5] bg-white px-4 lg:hidden">
    <!-- Mobile hamburger -->
    <button
      class="flex size-8 items-center justify-center rounded-lg text-[#999999] transition-colors hover:bg-gray-100 hover:text-[#030229]"
      @click="$emit('toggle-sidebar')"
    >
      <UIcon name="i-lucide-menu" class="size-5" />
    </button>

    <!-- Logo + App name (mobile) -->
    <img src="~/assets/icon/Subtract.svg" alt="Pre Booking" class="size-7 shrink-0" >
    <span class="flex-1 text-base font-bold text-[#030229]" style="font-family: 'Nunito', sans-serif;">Pre Booking</span>

    <!-- User avatar (mobile) -->
    <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFC7D4]">
      <UIcon name="i-lucide-user" class="size-4 text-[#200E32]" />
    </div>
  </header>
</template>
