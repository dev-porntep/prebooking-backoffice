<script setup lang="ts">
const isSidebarOpen = ref(false)
const mainEl = ref<HTMLElement | null>(null)

const route = useRoute()
watch(() => route.path, () => {
  mainEl.value?.scrollTo({ top: 0 })
})
</script>

<template>
  <div class="relative flex h-screen overflow-hidden bg-[#F7F7F8]">
    <!-- Mobile backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
        @click="isSidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar — slides in on mobile, always visible on desktop -->
    <div
      class="fixed inset-y-0 left-0 z-40 shrink-0 overflow-hidden transition-all duration-300 ease-in-out lg:static lg:w-[218px]"
      :class="isSidebarOpen ? 'translate-x-0 w-[218px]' : '-translate-x-full lg:translate-x-0'"
    >
      <LayoutAppSidebar @close="isSidebarOpen = false" />
    </div>

    <!-- Main area -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Mobile header -->
      <LayoutAppHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <!-- Page content -->
      <main ref="mainEl" class="flex-1 overflow-y-auto scroll-smooth">
        <div class="mx-auto max-w-7xl p-4 md:p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
