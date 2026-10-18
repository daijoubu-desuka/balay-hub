
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: ['@pinia/nuxt'],
  pinia: { storesDirs: ['./stores/**'] },

  experimental: { appManifest: false },

  routeRules: {
    '/account': { ssr: false },
    '/agent': { ssr: false },
    '/admin': { ssr: false },
    '/data/**': { static: true }
  },

  nitro: {
    prerender: {
      // Do not fail static generation on query-based search URLs.
      ignore: ['/**?*']
    }
  },

  css: ['~/assets/css/main.css'],

  app: {
    baseURL: '/balay-hub/',

    head: {
      htmlAttrs: { lang: 'en' },
      title: 'BahayHub | Butuan City Real Estate',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Browse houses, condominiums, commercial spaces and new developments in Butuan City.'
        },
        { name: 'theme-color', content: '#0b2a4a' }
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/balay-hub/favicon.svg'
        },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap'
        }
      ]
    },

    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
