<script setup lang="ts">
const isSidebarOpen = ref(false)
const isDesktopCollapsed = ref(false)
</script>

<template>
  <div class="relative flex h-screen overflow-hidden bg-slate-50 dark:bg-[#060B18]">
    <!-- Mobile backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
        @click="isSidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar wrapper — slides on mobile, collapsible on desktop -->
    <div
      class="fixed inset-y-0 left-0 z-40 shrink-0 overflow-hidden transition-all duration-300 ease-in-out lg:static"
      :class="[
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        isDesktopCollapsed ? 'lg:w-0' : 'lg:w-64',
      ]"
    >
      <LayoutAppSidebar @close="isSidebarOpen = false" />
    </div>

    <!-- Main area -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <LayoutAppHeader
        :desktop-collapsed="isDesktopCollapsed"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        @toggle-desktop-sidebar="isDesktopCollapsed = !isDesktopCollapsed"
      />

      <main class="flex-1 overflow-y-auto scroll-smooth">
        <!-- Subtle dot-grid background -->
        <div
          class="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-20"
          style="background-image: radial-gradient(circle at 1.5px 1.5px, rgba(224,0,0,0.10) 1.5px, transparent 0); background-size: 28px 28px;"
        />
        <div class="relative z-10 mx-auto max-w-7xl p-4 sm:p-6">
          <LayoutAppBreadcrumb class="mb-5" />

          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
