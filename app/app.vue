<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#0F172A' : '#F8FAFC')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap' },
    { rel: 'preload', href: '/fonts/BetterTogether/BetterTogether-Regular.ttf', as: 'font', type: 'font/ttf', crossorigin: '' },
    { rel: 'preload', href: '/fonts/BetterTogether/BetterTogether-Medium.ttf', as: 'font', type: 'font/ttf', crossorigin: '' },
    { rel: 'preload', href: '/fonts/BetterTogether/BetterTogether-Bold.ttf', as: 'font', type: 'font/ttf', crossorigin: '' },
  ],
  htmlAttrs: { lang: 'th' },
  titleTemplate: '%s | Prebooking Back Office',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
*, *::before, *::after {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: 'BetterTogether', sans-serif;
  font-size: 15px;
}

code, pre, .font-mono {
  font-family: 'JetBrains Mono', monospace;
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
