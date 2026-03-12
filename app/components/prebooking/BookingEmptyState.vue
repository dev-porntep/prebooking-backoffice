<script setup lang="ts">
interface Props {
  message?: string
}

const props = defineProps<Props>()
const { t } = useI18n()

const displayMessage = computed(() => props.message ?? t('prebooking.list.emptyState'))
</script>

<template>
  <div
    class="rounded-[10px] bg-white py-16 text-center text-sm text-[#030229]/40"
    style="box-shadow: 1px 17px 44px 0px rgba(3, 2, 41, 0.07);"
  >
    {{ displayMessage }}
  </div>
</template>
