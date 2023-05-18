// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['@/assets/main.css'],
  modules: ['@nuxtjs/tailwindcss', '@vee-validate/nuxt'],
  typescript: {
    shim: false,
  },
});
