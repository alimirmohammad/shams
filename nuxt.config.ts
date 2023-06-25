// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['@/assets/main.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@vee-validate/nuxt',
    '@alireza-ab/vue3-persian-datepicker/nuxt',
    '@vite-pwa/nuxt',
  ],
  typescript: {
    shim: false,
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'صندوق شمس',
      short_name: 'شمس',
      theme_color: '#6972F1',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
});
