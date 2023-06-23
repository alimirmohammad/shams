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
});
