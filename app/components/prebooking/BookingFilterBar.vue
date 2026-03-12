<script setup lang="ts">
interface Props {
  modelBookingNumber: string
  modelShop: string
  modelStatus: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelBookingNumber': [value: string]
  'update:modelShop': [value: string]
  'update:modelStatus': [value: string]
  'search': []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="mb-6 flex flex-wrap items-center gap-3">
    <!-- Booking number filter -->
    <div class="relative flex h-10 min-w-[160px] flex-1 items-center rounded-[10px] border border-[#E5E5E5] bg-white px-4 focus-within:border-[#605BFF]">
      <UIcon name="i-lucide-search" class="mr-2 size-4 shrink-0 text-[#030229]/30" />
      <input
        :value="modelBookingNumber"
        type="text"
        :placeholder="t('prebooking.filter.bookingNumber')"
        class="flex-1 bg-transparent text-sm text-[#030229] outline-none placeholder:text-[#030229]/30"
        @input="emit('update:modelBookingNumber', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <!-- Shop filter -->
    <div class="relative flex h-10 min-w-[160px] flex-1 items-center rounded-[10px] border border-[#E5E5E5] bg-white px-4 focus-within:border-[#605BFF]">
      <input
        :value="modelShop"
        type="text"
        :placeholder="t('prebooking.filter.shop')"
        class="flex-1 bg-transparent text-sm text-[#030229] outline-none placeholder:text-[#030229]/30"
        @input="emit('update:modelShop', ($event.target as HTMLInputElement).value)"
      >
      <UIcon name="i-lucide-chevron-down" class="ml-2 size-4 shrink-0 text-[#030229]/30" />
    </div>

    <!-- Status filter -->
    <div class="relative flex h-10 min-w-[140px] flex-1 items-center rounded-[10px] border border-[#E5E5E5] bg-white px-4 focus-within:border-[#605BFF]">
      <select
        :value="modelStatus"
        class="flex-1 appearance-none bg-transparent text-sm text-[#030229] outline-none"
        @change="emit('update:modelStatus', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('prebooking.filter.status') }}</option>
        <option value="Success">Success</option>
        <option value="Pending">Pending</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <UIcon name="i-lucide-chevron-down" class="pointer-events-none ml-2 size-4 shrink-0 text-[#030229]/30" />
    </div>

    <!-- Search button -->
    <button
      class="h-10 shrink-0 rounded-[10px] bg-[#605BFF] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      @click="emit('search')"
    >
      {{ t('prebooking.filter.search') }}
    </button>
  </div>
</template>
