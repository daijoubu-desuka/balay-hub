<script setup lang="ts">
useHead({
  title: 'Commercial Property in Butuan | BahayHub',
  meta: [{ name: 'description', content: 'Find shophouses, office floors, warehouses and commercial lots for sale or lease along Butuan City main business corridors.' }]
})

const router = useRouter()
// stock photography (Unsplash); a navy panel shows if one fails to load
const U = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`
const hide = (e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')

const propertyTypes = [
  {
    title: 'Shophouses & Retail', img: U('photo-1441986300917-64674bd600d8'), alt: 'Bright retail shop interior with merchandise on display',
    desc: 'Ground-floor retail units and shophouses along J.C. Aquino Ave, Montilla Blvd and Villanueva Street. Ideal for restaurants, boutiques and service businesses.',
    features: ['High foot traffic', 'Flexible lease terms', 'Street-front exposure'], price: '₱15,000–₱60,000', unit: 'per month'
  },
  {
    title: 'Office Spaces', img: U('photo-1497366216548-37526070297c'), alt: 'Modern open-plan office with desks and large windows',
    desc: 'Professional office floors and executive suites in the central business district, on short- or long-term lease.',
    features: ['CBD locations', 'Furnished options', 'Broadband-ready'], price: '₱8,000–₱35,000', unit: 'per month'
  },
  {
    title: 'Warehouses & Logistics', img: U('photo-1586528116311-ad8dd3c8310d'), alt: 'Warehouse aisle with tall stocked shelving',
    desc: 'Covered warehouses and open yards near the national highway and Bancasi Airport roads, suited to logistics and distribution.',
    features: ['Loading bay access', 'Near the national highway', 'High ceiling clearance'], price: '₱20,000–₱80,000', unit: 'per month'
  },
  {
    title: 'Commercial Lots', img: U('photo-1500382017468-9049fed747ef'), alt: 'Open land ready for development at golden hour',
    desc: 'Prime lots for sale along Butuan’s arterial roads, zoned for mixed-use, retail and light industrial development.',
    features: ['Zoned for commercial use', 'Transferable title', 'Multiple lot sizes'], price: '₱5,000–₱25,000', unit: 'per sqm'
  }
]

const corridors = [
  { name: 'J.C. Aquino Avenue', tag: 'Prime', img: U('photo-1449824913935-59a10b8d2000', 700), desc: 'The main commercial spine. Highest foot traffic, anchored by banks, supermarkets and government offices.' },
  { name: 'Montilla Boulevard', tag: 'Trending', img: U('photo-1477959858617-67f85cf4f1df', 700), desc: 'An upscale corridor with new restaurant concepts, wellness centers and professional services.' },
  { name: 'Bancasi Road', tag: 'Logistics', img: U('photo-1436491865332-7a61a109cc05', 700), desc: 'Next to Bancasi Airport. Built for logistics hubs, cargo forwarding and airport services.' },
  { name: 'National Highway, Ampayon', tag: 'Highway', img: U('photo-1469854523086-cc02fe5d8800', 700), desc: 'Highway frontage toward Davao. Best for fuel stations, fast food and transport businesses.' }
]

const reasons = [
  { icon: 'area', title: 'Growing economy', desc: 'Butuan is the regional center of Caraga, a fast-developing market with steady growth.' },
  { icon: 'pin', title: 'Trade hub', desc: 'Port access and Bancasi Airport connect Butuan to commerce across Mindanao.' },
  { icon: 'building', title: 'Infrastructure boom', desc: 'New roads and bridges are extending commercial reach beyond the city center.' },
  { icon: 'user', title: 'Young population', desc: 'A growing middle class drives demand for retail, food and professional services.' }
]

const stats = [
  { v: String(propertyTypes.length), l: 'Property types' },
  { v: '12+', l: 'Active listings' },
  { v: '₱8K', l: 'Leases from, per month' },
  { v: String(corridors.length), l: 'Key business corridors' }
]

function browseCommercial() { router.push('/browse') }
function browseType(title: string) { router.push({ path: '/browse', query: { q: title.split(' ')[0] } }) }
</script>

<template>
  <div class="ph-page">
    <section class="ph-hero">
      <img :src="U('photo-1486406146926-c627a92ad1ab', 1800)" alt="" fetchpriority="high" @error="hide" />
      <div class="wrap ph-hero-in">
        <nav class="ph-crumb" aria-label="Breadcrumb"><NuxtLink to="/">Home</NuxtLink><span>/</span><span>Commercial</span></nav>
        <p class="ph-eyebrow">Commercial real estate · Butuan City</p>
        <h1>Grow your business in Butuan’s commercial core.</h1>
        <p>Shophouses, office floors, warehouses and prime lots along the city’s busiest corridors — for sale and for lease.</p>
        <div class="ph-hero-cta">
          <a href="#types" class="btn btn-orange btn-lg">Explore property types</a>
          <button class="btn btn-lg ph-btn-glass" @click="browseCommercial">Browse listings →</button>
        </div>
      </div>
    </section>

    <div class="wrap">
      <div class="ph-stats">
        <div v-for="s in stats" :key="s.l"><b>{{ s.v }}</b><span>{{ s.l }}</span></div>
      </div>
    </div>

    <section id="types" class="ph-section" style="scroll-margin-top:80px">
      <div class="wrap">
        <div class="ph-head">
          <div>
            <p class="ph-kicker">What’s available</p>
            <h2>Commercial property types</h2>
            <p>From ground-floor retail to warehouse logistics — what Butuan’s commercial market offers today.</p>
          </div>
        </div>
        <div class="ph-grid2">
          <article v-for="(t, i) in propertyTypes" :key="t.title" v-reveal="i" class="ph-card ph-hcard">
            <div class="ph-media"><img :src="t.img" :alt="t.alt" loading="lazy" @error="hide" /></div>
            <div class="ph-body">
              <h3>{{ t.title }}</h3>
              <p class="ph-desc">{{ t.desc }}</p>
              <ul class="ph-feats"><li v-for="f in t.features" :key="f"><Icon name="check" />{{ f }}</li></ul>
              <div class="ph-foot">
                <span class="ph-price"><small>Typical range</small>{{ t.price }} <span class="x-muted">{{ t.unit }}</span></span>
                <button class="btn btn-navy btn-sm" @click="browseType(t.title)">Browse →</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="ph-section tint">
      <div class="wrap">
        <div class="ph-head">
          <div>
            <p class="ph-kicker">Location matters</p>
            <h2>Key business corridors</h2>
            <p>Butuan’s top commercial strips and what makes each one worth a look.</p>
          </div>
        </div>
        <div class="ph-tiles">
          <article v-for="(c, i) in corridors" :key="c.name" v-reveal="i" class="ph-tile">
            <div class="ph-media">
              <img :src="c.img" :alt="`${c.name}, Butuan City`" loading="lazy" @error="hide" />
              <div class="ph-chips"><span class="ph-chip">{{ c.tag }}</span></div>
              <div class="ph-on-photo"><b>{{ c.name }}</b></div>
            </div>
            <p>{{ c.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="ph-section">
      <div class="wrap">
        <div class="ph-head">
          <div>
            <p class="ph-kicker">The case for Butuan</p>
            <h2>Why invest here</h2>
            <p>Caraga’s regional center is a market on the rise, with strong fundamentals for commercial investment.</p>
          </div>
        </div>
        <div class="ph-reasons">
          <div v-for="(r, i) in reasons" :key="r.title" v-reveal="i">
            <Icon :name="r.icon" />
            <h4>{{ r.title }}</h4>
            <p>{{ r.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="ph-cta">
      <img :src="U('photo-1497366811353-6870744d04b2', 1800)" alt="" loading="lazy" @error="hide" />
      <div class="wrap ph-cta-in">
        <div>
          <h2>Find your commercial space today.</h2>
          <p>Browse every commercial listing in Butuan City and filter by type, location and budget.</p>
        </div>
        <button class="btn btn-orange btn-lg" @click="browseCommercial">Browse commercial listings →</button>
      </div>
    </section>
  </div>
</template>
