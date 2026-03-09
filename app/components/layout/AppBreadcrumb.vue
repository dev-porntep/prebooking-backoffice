<script setup lang="ts">
const route = useRoute()

const breadcrumbs = computed(() => {
  const items = [
    { label: 'Home', icon: 'i-lucide-home', to: '/' },
  ]

  const routeMap: Record<string, string> = {
    '/display': 'Display',
    '/import': 'Import Excel',
    '/export': 'Export Excel',
    '/login': 'Login',
  }

  const label = routeMap[route.path]
  if (label) {
    items.push({ label, icon: '', to: route.path })
  }

  return items
})
</script>

<template>
  <UBreadcrumb :items="breadcrumbs" />
</template>
