// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  app: {
    baseURL: process.env['NUXT_APP_BASE_URL'] ?? '/',
  },
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
  },

  components: {
    dirs: [
      { path: '~/components/settings', pathPrefix: false },
      { path: '~/components/prebooking', pathPrefix: false },
      { path: '~/components/layout', pathPrefix: false },
      { path: '~/components/ui', pathPrefix: false, extensions: ['vue'] },
    ],
  },

  modules: [
    '@nuxtjs/color-mode',
    ['@nuxt/icon', { componentName: 'UIcon' }],
    '@nuxt/eslint',
    '@pinia/nuxt',
    'nuxt-auth-utils',
    ['@nuxtjs/i18n', {
      locales: [
        { code: 'th', name: 'ไทย', file: 'th.json' },
        { code: 'en', name: 'English', file: 'en.json' },
      ],
      defaultLocale: 'th',
      langDir: 'locales/',
      strategy: 'no_prefix',
      detectBrowserLanguage: false,
    }],
  ],

  // Light mode only — no dark mode support
  colorMode: {
    preference: 'light',
    fallback: 'light',
    storageKey: 'color-mode',
    classSuffix: '',
  },

  runtimeConfig: {
    backendApiUrl: process.env['BACKEND_API_URL'] || 'http://localhost:8080',
    logging: {
      logPath:     process.env['LOG_PATH']         || 'logs/app',
      logToFile:   process.env['LOG_TO_FILE']       !== 'false',
      logLevel:    process.env['LOG_LEVEL']         || 'info',
      logChannel:  process.env['LOG_CHANNEL']       || 'prebooking-backoffice',
      logProduct:  process.env['LOG_PRODUCT']       || 'backoffice',
      serviceName: process.env['LOG_SERVICE_NAME']  || 'prebooking-backoffice',
    },
    session: {
      maxAge: 60 * 60 * 24,
      password: process.env['NUXT_SESSION_PASSWORD'] || 'default-password-must-be-at-least-32-chars',
    },
    excel: {
      maxFileSize: 50 * 1024 * 1024,
      chunkSize: 500,
      maxRowsPerFile: 100_000,
      streamThreshold: 5000,
    },
    public: {
      appName: 'Prebooking Back Office',
      maxUploadSize: 50,
      authEnabled: process.env['NUXT_PUBLIC_AUTH_ENABLED'] !== 'false',
      logToFile: process.env['LOG_TO_FILE'] !== 'false',
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  nitro: {
    routeRules: {
      '/api/import/**':   { headers: { 'x-max-body-size': '50mb' } },
      '/api/settings/**': { headers: { 'x-max-body-size': '50mb' } },
    },
    experimental: {
      tasks: true,
      asyncContext: true,
    },
  },

  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
  },
})
