<script setup lang="ts">
interface Props {
  modelFrom: string
  modelTo: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelFrom': [value: string]
  'update:modelTo': [value: string]
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex items-center gap-2 rounded-[10px] border border-[#E5E5E5] bg-white px-3 py-2">
      <input
        :value="modelFrom"
        type="text"
        class="w-24 bg-transparent text-sm text-[#030229] outline-none"
        placeholder="DD-MM-YYYY"
        @input="emit('update:modelFrom', ($event.target as HTMLInputElement).value)"
      >
      <UIcon name="i-lucide-chevron-down" class="size-4 text-[#030229]/50" />
    </div>
    <span class="text-sm text-[#030229]/50">–</span>
    <div class="flex items-center gap-2 rounded-[10px] bg-[#605BFF] px-3 py-2">
      <input
        :value="modelTo"
        type="text"
        class="w-24 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
        placeholder="DD-MM-YYYY"
        @input="emit('update:modelTo', ($event.target as HTMLInputElement).value)"
      >
      <UIcon name="i-lucide-chevron-down" class="size-4 text-white" />
    </div>
  </div>
</template>
