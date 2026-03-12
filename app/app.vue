<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#0F172A' : '#F8FAFC')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'apple-touch-icon', href: '/favicon.svg' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap' },
  ],
  htmlAttrs: { lang: 'th' },
  titleTemplate: '%s | Prebooking Back Office',
})

useSeoMeta({
  title: 'Prebooking Back Office',
  description: 'ระบบจัดการหลังบ้าน Prebooking สำหรับอำนวยความสะดวกในการจองและจัดการสินค้า',
  ogTitle: 'Prebooking Back Office',
  ogDescription: 'ระบบจัดการหลังบ้าน Prebooking สำหรับอำนวยความสะดวกในการจองและจัดการสินค้า',
  ogImage: '/favicon.svg',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLoadingIndicator color="#E2231A" :height="2" :duration="1500" :throttle="100" />
  <NuxtLayout>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
  </NuxtLayout>
  <Toaster />
</template>

<style>
*, *::before, *::after {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: 'Nunito', sans-serif;
  font-size: 15px;
}

code, pre, .font-mono {
  font-family: 'JetBrains Mono', monospace;
}

.page-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

::selection {
  background-color: rgba(224, 0, 0, 0.15);
  color: inherit;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(224, 0, 0, 0.25); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: rgba(224, 0, 0, 0.45); }
</style>
