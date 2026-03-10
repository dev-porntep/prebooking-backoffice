<script setup lang="ts">
const route = useRoute()

const breadcrumbs = computed(() => {
  const items = [
    { label: 'Home', icon: 'i-lucide-home', to: '/' },
  ]

  const routeMap: Record<string, string> = {
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
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, index) in breadcrumbs" :key="index">
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <NuxtLink :to="item.to" class="flex items-center gap-2">
              <UIcon v-if="item.icon" :name="item.icon" class="size-4" />
              {{ item.label }}
            </NuxtLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
