<script setup lang="ts">
useHead({
  title: 'BahayHub | Butuan City Real Estate',
  meta: [{ name: 'description', content: 'BahayHub is Butuan City’s home for real estate: homes for sale and rent, new developments, commercial spaces and PRC-verified agents.' }]
})

const store = usePropertyStore()
await useAsyncData('properties', async () => { await store.load(); return true })

const router = useRouter()
const auth = useAuthStore()
const agents = useAgents()
const reviews = useReviewStore()
const face = useFace()
const U = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`
const hide = (e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')

const q = ref('')
function search() { router.push({ path: '/browse', query: q.value.trim() ? { q: q.value.trim() } : {} }) }
const quick = [
  { label: 'House & Lot', q: 'House' }, { label: 'Condominiums', q: 'Condominium' },
  { label: 'Libertad', q: 'Libertad' }, { label: 'Villa Kananga', q: 'Villa Kananga' }
]

const explore = [
  { title: 'Homes for sale', text: 'Houses, condos and lots across the city.', to: '/browse', img: U('photo-1600596542815-ffad4c1539a9') },
  { title: 'Homes for rent', text: 'Furnished units and apartments, priced per month.', to: '/for-rent', img: U('photo-1522708323590-d24dbb6b0267') },
  { title: 'New developments', text: 'Pre-selling and ready-for-occupancy projects.', to: '/new-developments', img: U('photo-1545324418-cc1a3fa10c00') },
  { title: 'Commercial', text: 'Shops, offices, warehouses and lots for business.', to: '/commercial', img: U('photo-1486406146926-c627a92ad1ab') }
]

const featured = computed(() => store.items.filter(p => p.status === 'available').slice(0, 3))
const topAgents = computed(() => agents.value.filter(a => a.verified).slice(0, 3))
const avgRating = computed(() => { const l = reviews.items; return l.length ? (l.reduce((n, r) => n + r.rating, 0) / l.length).toFixed(1) : '—' })
const numbers = computed(() => [
  { v: String(store.items.length || 18), l: 'Listings in Butuan' },
  { v: String(agents.value.filter(a => a.verified).length), l: 'PRC-verified agents' },
  { v: String(LOCATIONS.length), l: 'Neighborhoods covered' },
  { v: avgRating.value + ' ★', l: 'Average agent rating' }
])
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('')

const buyerSteps = [
  { t: 'Search and save', d: 'Filter by price, area and type. Save the homes you like to compare later.' },
  { t: 'Verify once', d: 'Create a free account and upload a valid ID. An admin checks it, usually within a day.' },
  { t: 'Talk to a verified agent', d: 'Message agents, request viewings and get answers in one place.' }
]
const agentSteps = [
  { t: 'Apply with your license', d: 'Submit your PRC license, TIN and supporting documents.' },
  { t: 'Get the PRC Verified badge', d: 'An admin reviews your application and approves it.' },
  { t: 'List and close', d: 'Post listings, answer clients and track your commission.' }
]
</script>

<template>
  <div class="ph-page">
    <!-- HERO -->
    <section class="ph-hero intro-hero">
      <img :src="U('photo-1477959858617-67f85cf4f1df', 1920)" alt="" fetchpriority="high" @error="hide" />
      <div class="wrap ph-hero-in">
        <p class="ph-eyebrow">Butuan City · Agusan del Norte</p>
        <h1>Butuan’s home for real estate.</h1>
        <p>Find a house, condo, rental or commercial space — and the PRC-verified local agent to help you close it.</p>
        <form class="intro-search" role="search" @submit.prevent="search">
          <Icon name="search" />
          <label class="sr-only" for="intro-q">Search properties</label>
          <input id="intro-q" v-model="q" placeholder="Try “Libertad”, “condo” or “3 bedroom”" />
          <button class="btn btn-orange">Search</button>
        </form>
        <div class="intro-quick">
          <span>Popular:</span>
          <NuxtLink v-for="c in quick" :key="c.label" :to="{ path: '/browse', query: { q: c.q } }">{{ c.label }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- INTRODUCTION -->
    <section class="ph-section">
      <div class="wrap intro-split">
        <div>
          <p class="ph-kicker">Welcome to BahayHub</p>
          <h2 class="intro-h2">Real estate in Butuan, made simple and safe.</h2>
          <p class="intro-lead">BahayHub brings Butuan’s listings, agents and buyers into one place. Every agent is checked against their PRC license, every buyer account is checked against a valid ID, and every listing stays local to Butuan City.</p>
          <ul class="ph-feats intro-list">
            <li><Icon name="check" />Homes for sale and rent, new developments and commercial spaces</li>
            <li><Icon name="check" />Agent profiles with real listings, closed deals and client reviews</li>
            <li><Icon name="check" />Built-in messages and viewing requests, no phone tag</li>
          </ul>
          <div class="ph-hero-cta" style="margin-top:24px">
            <NuxtLink to="/browse" class="btn btn-navy btn-lg">Browse properties</NuxtLink>
            <NuxtLink to="/agents" class="btn btn-ghost btn-lg">Find an agent →</NuxtLink>
          </div>
        </div>
        <div class="intro-collage" aria-hidden="true">
          <img :src="U('photo-1600585154340-be6161a56a0c', 800)" alt="" loading="lazy" @error="hide" />
          <img :src="U('photo-1460317442991-0ec209397118', 600)" alt="" loading="lazy" @error="hide" />
          <img :src="U('photo-1497366216548-37526070297c', 600)" alt="" loading="lazy" @error="hide" />
        </div>
      </div>
    </section>

    <!-- EXPLORE -->
    <section class="ph-section tint">
      <div class="wrap">
        <div class="ph-head"><div><p class="ph-kicker">Explore</p><h2>What are you looking for?</h2></div></div>
        <div class="ph-tiles">
          <NuxtLink v-for="(e, i) in explore" :key="e.title" v-reveal="i" :to="e.to" class="ph-tile home-tile">
            <div class="ph-media">
              <img :src="e.img" :alt="e.title" loading="lazy" @error="hide" />
              <div class="ph-on-photo"><b>{{ e.title }}</b><small>{{ e.text }}</small></div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- FEATURED -->
    <section class="ph-section">
      <div class="wrap">
        <div class="ph-head">
          <div><p class="ph-kicker">Featured</p><h2>Available now</h2><p>A few homes ready for viewing this week.</p></div>
          <NuxtLink to="/browse" class="btn btn-ghost">See all listings →</NuxtLink>
        </div>
        <ClientOnly>
          <div v-if="featured.length" class="grid intro-featured"><PropertyCard v-for="p in featured" :key="p.id" :item="p" /></div>
          <div v-else class="grid intro-featured"><div v-for="n in 3" :key="n" class="skeleton" /></div>
          <template #fallback><div class="grid intro-featured"><div v-for="n in 3" :key="n" class="skeleton" /></div></template>
        </ClientOnly>
      </div>
    </section>

    <!-- NUMBERS on a building photo -->
    <section class="ph-cta intro-band">
      <img :src="U('photo-1515263487990-61b07816b324', 1800)" alt="" loading="lazy" @error="hide" />
      <div class="wrap intro-numbers">
        <ClientOnly>
          <div v-for="n in numbers" :key="n.l"><b>{{ n.v }}</b><span>{{ n.l }}</span></div>
          <template #fallback><div v-for="n in 4" :key="n"><b>&nbsp;</b><span>&nbsp;</span></div></template>
        </ClientOnly>
      </div>
    </section>

    <!-- AGENTS -->
    <section class="ph-section">
      <div class="wrap">
        <div class="ph-head">
          <div><p class="ph-kicker">Find an agent</p><h2>Meet Butuan’s top-rated agents</h2><p>PRC-verified, reviewed by real clients, and focused on the neighborhoods they know.</p></div>
          <NuxtLink to="/agents" class="btn btn-ghost">All agents →</NuxtLink>
        </div>
        <ClientOnly>
          <div class="ph-grid3">
            <NuxtLink v-for="a in topAgents" :key="a.slug" :to="`/agents/${a.slug}`" class="ph-card intro-agent">
              <div class="x-profile-photo" style="width:72px;height:72px;font-size:22px">
                <img v-if="face(a.id)" :src="face(a.id)" :alt="`Photo of ${a.name}`" /><span v-else aria-hidden="true">{{ initials(a.name) }}</span>
              </div>
              <div style="min-width:0">
                <b class="intro-agent-name">{{ a.name }}</b>
                <small class="x-muted">{{ a.licenseType }} · {{ a.areas.slice(0, 2).join(', ') }}</small>
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px"><Stars :value="a.rating" :count="a.reviewCount" small /><VerifiedBadge /></div>
                <small class="x-muted">{{ a.listings.length }} listings · {{ a.closed }} closed deals</small>
              </div>
            </NuxtLink>
          </div>
          <template #fallback><div class="ph-grid3"><div v-for="n in 3" :key="n" class="skeleton" style="height:130px;border-radius:20px" /></div></template>
        </ClientOnly>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="ph-section tint">
      <div class="wrap">
        <div class="ph-head"><div><p class="ph-kicker">How it works</p><h2>Three steps, whichever side you’re on</h2></div></div>
        <div class="intro-how">
          <div class="ws-card">
            <p class="ws-card-eyebrow">For buyers and renters</p>
            <ol class="ph-steps intro-steps">
              <li v-for="(s, i) in buyerSteps" :key="s.t" class="ph-step"><em>Step 0{{ i + 1 }}</em><h4>{{ s.t }}</h4><p>{{ s.d }}</p></li>
            </ol>
            <NuxtLink :to="auth.user ? '/browse' : '/signup'" class="btn btn-navy">{{ auth.user ? 'Start browsing' : 'Create a free account' }} →</NuxtLink>
          </div>
          <div class="ws-card">
            <p class="ws-card-eyebrow">For licensed agents</p>
            <ol class="ph-steps intro-steps">
              <li v-for="(s, i) in agentSteps" :key="s.t" class="ph-step"><em>Step 0{{ i + 1 }}</em><h4>{{ s.t }}</h4><p>{{ s.d }}</p></li>
            </ol>
            <NuxtLink to="/signup?role=agent" class="btn btn-orange">Apply as an agent →</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- CLOSING -->
    <section class="ph-cta">
      <img :src="U('photo-1600607687939-ce8a6c25118c', 1800)" alt="" loading="lazy" @error="hide" />
      <div class="wrap ph-cta-in">
        <div>
          <h2>Your next home in Butuan starts here.</h2>
          <p>Browse freely — no account needed to look around. Sign up when you’re ready to talk to an agent.</p>
        </div>
        <NuxtLink to="/browse" class="btn btn-orange btn-lg">Browse properties →</NuxtLink>
      </div>
    </section>
  </div>
</template>
