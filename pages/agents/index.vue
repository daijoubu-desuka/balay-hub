<script setup lang="ts">
useHead({
  title: 'Find an Agent in Butuan | BahayHub',
  meta: [{ name: 'description', content: 'Find PRC-verified real estate agents in Butuan City. Compare their listings, closed deals and client reviews.' }]
})

const store = usePropertyStore()
await useAsyncData('properties', async () => { await store.load(); return true })
const agents = useAgents()
const face = useFace()

const q = ref('')
const verifiedOnly = ref(false)
const sort = ref<'rating' | 'listings' | 'deals'>('rating')
const shown = computed(() => {
  const s = q.value.trim().toLowerCase()
  const l = agents.value.filter(a => (!verifiedOnly.value || a.verified) && (!s || `${a.name} ${a.areas.join(' ')} ${a.licenseType}`.toLowerCase().includes(s)))
  const by = { rating: (a: typeof l[number]) => a.rating, listings: (a: typeof l[number]) => a.listings.length, deals: (a: typeof l[number]) => a.closed }[sort.value]
  return [...l].sort((a, b) => by(b) - by(a))
})
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('')
const hide = (e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')
</script>

<template>
  <div class="ph-page">
    <section class="ph-hero ph-hero-sm">
      <img src="https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1920&q=80" alt="" fetchpriority="high" @error="hide" />
      <div class="wrap ph-hero-in">
        <nav class="ph-crumb" aria-label="Breadcrumb"><NuxtLink to="/">Home</NuxtLink><span>/</span><span>Find an Agent</span></nav>
        <p class="ph-eyebrow">Agent directory · Butuan City</p>
        <h1>Find an agent you can trust.</h1>
        <p>Every license here is checked by a BahayHub admin. Compare listings, closed deals and what past clients say before you reach out.</p>
      </div>
    </section>

    <div class="wrap">
      <div class="x-agent-bar">
        <label class="sr-only" for="ag-q">Search agents</label>
        <div class="field-box" style="flex:1;min-width:220px"><Icon name="search" /><input id="ag-q" v-model="q" placeholder="Search by name or area, e.g. Libertad" /></div>
        <label class="sr-only" for="ag-sort">Sort agents</label>
        <select id="ag-sort" v-model="sort" class="input" style="width:auto;height:46px">
          <option value="rating">Top rated</option><option value="listings">Most listings</option><option value="deals">Most closed deals</option>
        </select>
        <label class="x-switch"><input v-model="verifiedOnly" type="checkbox" role="switch" /> PRC verified only</label>
      </div>
    </div>

    <section class="ph-section" style="padding-top:28px">
      <div class="wrap">
        <p class="x-muted" aria-live="polite" style="margin-bottom:14px">{{ shown.length }} agent{{ shown.length === 1 ? '' : 's' }} in Butuan City</p>
        <div v-if="!store.loaded && store.loading" class="ph-grid3"><div v-for="n in 3" :key="n" class="skeleton" style="height:340px;border-radius:20px" /></div>
        <div v-else-if="!shown.length" class="empty"><Icon name="search" /><h3>No agents match</h3><p class="x-muted">Try another name or area, or turn off “PRC verified only”.</p></div>
        <div v-else class="ph-grid3">
          <NuxtLink v-for="(a, i) in shown" :key="a.slug" v-reveal="i" :to="`/agents/${a.slug}`" class="ph-card x-agent-card">
            <div class="x-agent-cover" />
            <div class="x-agent-face">
              <img v-if="face(a.id)" :src="face(a.id)" :alt="`Photo of ${a.name}`" />
              <span v-else aria-hidden="true">{{ initials(a.name) }}</span>
            </div>
            <div class="ph-body" style="text-align:center;align-items:center;padding-top:8px">
              <h3>{{ a.name }}</h3>
              <p class="x-muted" style="margin-top:-6px">{{ a.licenseType }}<template v-if="a.years"> · {{ a.years }} yrs</template></p>
              <VerifiedBadge v-if="a.verified" />
              <span v-else class="x-pill pending">Verification pending</span>
              <Stars :value="a.rating" :count="a.reviewCount" />
              <dl class="x-agent-nums">
                <div><dt>Listings</dt><dd>{{ a.listings.length }}</dd></div>
                <div><dt>Closed deals</dt><dd>{{ a.closed }}</dd></div>
                <div><dt>Reviews</dt><dd>{{ a.reviewCount }}</dd></div>
              </dl>
              <p class="x-agent-areas"><Icon name="pin" /> {{ a.areas.slice(0, 3).join(' · ') || 'Butuan City' }}</p>
              <span class="btn btn-navy" style="width:100%;justify-content:center;margin-top:auto">View profile →</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="ph-cta">
      <img src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1800&q=80" alt="" loading="lazy" @error="hide" />
      <div class="wrap ph-cta-in">
        <div>
          <h2>Are you a licensed agent?</h2>
          <p>Apply with your PRC license. Once an admin verifies you, your profile and listings appear here for Butuan buyers and renters.</p>
        </div>
        <NuxtLink to="/signup?role=agent" class="btn btn-orange btn-lg">Apply as an agent →</NuxtLink>
      </div>
    </section>
  </div>
</template>
