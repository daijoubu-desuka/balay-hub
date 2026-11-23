import { readFileSync } from 'node:fs'

// Agent profile pages are client-rendered, so list them here to get a real page per agent on static hosting.
// Names come from the listings plus the seeded PRC records (stores/credentials.ts).
const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const listingAgents = (JSON.parse(readFileSync('public/data/properties.json', 'utf8')) as { agent: { name: string } }[]).map(p => p.agent.name)
const agentRoutes = [...new Set([...listingAgents, 'Rica Santos', 'Leo Ocampo', 'Daniel Bantillo'])].map(n => `/agents/${slug(n)}`)


export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: ['@pinia/nuxt'],
  pinia: { storesDirs: ['./stores/**'] },

  experimental: { appManifest: false },

  routeRules: {
    '/login': { ssr: false },
    '/signup': { ssr: false },
    '/account': { ssr: false },
    '/agent': { ssr: false },
    '/admin': { ssr: false },
    '/messages': { ssr: false },
    '/agents': { ssr: false },
    '/agents/**': { ssr: false },
    '/data/**': { static: true }
  },

  nitro: {
    prerender: {
      routes: ['/browse', '/agents', ...agentRoutes],
      // Exclude query-based search URLs from static prerendering.
      ignore: [
        (route) => route.includes('?q=')
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  app: {
    baseURL: '/balay-hub/',

    head: {
      htmlAttrs: { lang: 'en' },
      title: 'BahayHub | Butuan City Real Estate',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        },
        {
          name: 'description',
          content: 'Browse houses, condominiums, commercial spaces and new developments in Butuan City.'
        },
        { property: 'og:site_name', content: 'BahayHub' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'BahayHub | Butuan City Real Estate' },
        { property: 'og:description', content: 'Browse houses, condominiums, commercial spaces and new developments in Butuan City.' },
        { name: 'twitter:card', content: 'summary' },
        {
          name: 'theme-color',
          content: '#0b2a4a'
        }
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/balay-hub/favicon.svg'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap'
        }
      ]
    },

    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' }
  }
})
