// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@pinia/nuxt',
    'nuxt-auth-utils',
  ],

  // Use cookie-based storage so SSR and client agree on initial color mode
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    storageKey: 'color-mode',
  },

  runtimeConfig: {
    backendApiUrl: process.env['BACKEND_API_URL'] || 'http://localhost:8080',
    sso: {
      clientId: process.env['SSO_CLIENT_ID'],
      clientSecret: process.env['SSO_CLIENT_SECRET'],
      issuer: process.env['SSO_ISSUER_URL'],
      redirectUri: process.env['SSO_REDIRECT_URI'],
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
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  nitro: {
    routeRules: {
      '/api/import/**': {
        headers: { 'x-max-body-size': '50mb' },
      },
    },
    experimental: {
      tasks: true,
    },
  },
})
