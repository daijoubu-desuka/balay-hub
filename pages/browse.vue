<script setup lang="ts">
useHead({
  title: 'Browse Properties in Butuan | BahayHub',
  meta: [{ name: 'description', content: 'Browse houses, condominiums, lots, and commercial spaces for sale in Butuan City. Filter by price, location, and type.' }]
})

const store = usePropertyStore()
// same key as PropertyBrowser, so the data is fetched once and the hero numbers render on the server too
await useAsyncData('properties', async () => { await store.load(); return true })
const U = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`
const hide = (e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')

// live numbers from the listing data (fallbacks while it loads)
const sale = computed(() => store.items.filter(p => p.listing === 'sale'))
const stats = computed(() => [
  { v: String(store.items.length || '—'), l: 'Listings in Butuan' },
  { v: String(new Set(store.items.map(p => p.location)).size || LOCATIONS.length), l: 'Neighborhoods' },
  { v: sale.value.length ? pesoShort(Math.min(...sale.value.map(p => p.price))) : '—', l: 'Homes from' },
  { v: String(new Set(store.items.map(p => p.type)).size || 4), l: 'Property types' }
])

const areas = [
  { name: 'Baan Riverside', note: 'Riverside living, near the city center', img: U('photo-1600596542815-ffad4c1539a9') },
  { name: 'Libertad', note: 'Quiet streets, schools and markets', img: U('photo-1568605114967-8130f3a36994') },
  { name: 'Villa Kananga', note: 'Growing family neighborhood', img: U('photo-1564013799919-ab600027ffc6') },
  { name: 'J.C. Aquino Avenue', note: 'Condos on the main corridor', img: U('photo-1545324418-cc1a3fa10c00') }
]
const count = (loc: string) => store.items.filter(p => p.location.includes(loc.split(' ')[0])).length

const trust = [
  { icon: 'shield', title: 'PRC-verified agents', text: 'Every agent submits a PRC license that an admin reviews before they can publish a listing.' },
  { icon: 'user', title: 'Verified buyers', text: 'Every buyer account is checked against a valid government ID, so agents know who they are talking to.' },
  { icon: 'pin', title: 'Butuan-local only', text: 'Listings, prices and neighborhoods are limited to Butuan City, Agusan del Norte.' }
]

function pickArea(name: string) {
  store.filters.query = name
  document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="home">
    <section class="ph-hero home-hero">
      <img :src="U('photo-1512917774080-9991f1c4c750', 1920)" alt="" fetchpriority="high" @error="hide" />
      <div class="wrap ph-hero-in">
        <p class="ph-eyebrow">Butuan City · Agusan del Norte</p>
        <h1>Find your home in Butuan City.</h1>
        <p>Houses, condominiums, lots and commercial spaces across Butuan’s most sought-after neighborhoods — listed by PRC-verified local agents.</p>
        <dl class="home-stats">
          <div v-for="s in stats" :key="s.l"><dt>{{ s.l }}</dt><dd>{{ s.v }}</dd></div>
        </dl>
      </div>
    </section>

    <div class="pb-overlap">
      <PropertyBrowser :preset="{ mode: 'sale' }" :hide-toggle="true" />
    </div>

    <section class="ph-section tint">
      <div class="wrap">
        <div class="ph-head">
          <div>
            <p class="ph-kicker">Explore by neighborhood</p>
            <h2>Where Butuan likes to live</h2>
            <p>Start from an area you know. Tap one to filter the listings above.</p>
          </div>
          <NuxtLink to="/agents" class="btn btn-ghost">Find an agent →</NuxtLink>
        </div>
        <div class="ph-tiles">
          <button v-for="(a, i) in areas" :key="a.name" v-reveal="i" type="button" class="ph-tile home-tile" @click="pickArea(a.name)">
            <div class="ph-media">
              <img :src="a.img" :alt="`Homes in ${a.name}, Butuan City`" loading="lazy" @error="hide" />
              <div class="ph-chips"><span class="ph-chip">{{ count(a.name) }} listing{{ count(a.name) === 1 ? '' : 's' }}</span></div>
              <div class="ph-on-photo"><b>{{ a.name }}</b><small>{{ a.note }}</small></div>
            </div>
          </button>
        </div>
      </div>
    </section>

    <section class="ph-section">
      <div class="wrap">
        <div class="ph-head">
          <div>
            <p class="ph-kicker">Why BahayHub</p>
            <h2>Built on trust, not just listings</h2>
          </div>
        </div>
        <div class="ph-reasons" style="grid-template-columns:repeat(3,1fr)">
          <div v-for="(t, i) in trust" :key="t.title" v-reveal="i">
            <Icon :name="t.icon" />
            <h4>{{ t.title }}</h4>
            <p>{{ t.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
