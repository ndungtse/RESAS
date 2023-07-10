// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  runtimeConfig: {
    public: {
      API_KEY: process.env.NUXT_RESAS_API_KEY,
    },
  },
});
