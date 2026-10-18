<script setup lang="ts">
useHead({
  title: 'Commercial Property in Butuan | BahayHub',
  meta: [{ name: 'description', content: 'Find shophouses, office floors, warehouses and commercial lots for sale or lease along Butuan City main business corridors.' }]
})

const router = useRouter()

const propertyTypes = [
  {
    icon: '🏪', title: 'Shophouses & Retail', desc: 'Ground-floor retail units and shophouses along J.C. Aquino Ave, Montilla Blvd, and Villanueva Street. Ideal for restaurants, boutiques, and service businesses.',
    features: ['High foot traffic locations', 'Flexible lease terms', 'Street-front exposure'], avgPrice: '₱15,000–₱60,000/mo'
  },
  {
    icon: '🏢', title: 'Office Spaces', desc: 'Professional office floors and executive suites in Butuan city central business district. Available on short-term and long-term lease.',
    features: ['CBD locations', 'Furnished options available', 'Broadband-ready'], avgPrice: '₱8,000–₱35,000/mo'
  },
  {
    icon: '🏭', title: 'Warehouses & Logistics', desc: 'Covered warehouses and open storage yards near the national highway and Bancasi Airport access roads. Suitable for logistics and distribution.',
    features: ['Loading bay access', 'Near national highway', 'High-ceiling clearance'], avgPrice: '₱20,000–₱80,000/mo'
  },
  {
    icon: '🌐', title: 'Commercial Lots', desc: 'Prime commercial lots for sale along Butuan major arterial roads. Zoned for mixed-use, retail, and light industrial development.',
    features: ['Zoned for commercial use', 'Title transferable', 'Multiple lot sizes'], avgPrice: '₱5,000–₱25,000/sqm'
  }
]

const corridors = [
  { name: 'J.C. Aquino Avenue', desc: 'Butuan main commercial spine. Highest foot traffic, anchored by banks, supermarkets, and government offices.', icon: '🛣️', tag: 'Prime' },
  { name: 'Montilla Boulevard', desc: 'The emerging upscale corridor with new restaurant concepts, wellness centers, and professional services.', icon: '🏙️', tag: 'Trending' },
  { name: 'Bancasi Road', desc: 'Near Bancasi Airport. Ideal for logistics hubs, cargo forwarding, and airport-adjacent services.', icon: '✈️', tag: 'Logistics' },
  { name: 'National Highway (Ampayon)', desc: 'High-visibility highway frontage connecting Butuan to Davao. Best for fuel stations, fast food, and transport-related businesses.', icon: '🛤️', tag: 'Highway' }
]

const reasons = [
  { icon: '📈', title: 'Growing Economy', desc: 'Butuan is the regional center of CARAGA, a rapidly developing market with consistent GDP growth.' },
  { icon: '🚢', title: 'Trade Hub', desc: 'Strategic port access and the Bancasi Airport connect Butuan to Mindanao-wide commerce.' },
  { icon: '🏗️', title: 'Infrastructure Boom', desc: 'Major road and bridge projects are expanding the city commercial reach beyond the city center.' },
  { icon: '👥', title: 'Young Population', desc: 'A growing middle-class and young consumer base drives demand for retail, food, and professional services.' }
]

function browseCommercial() { router.push('/') }
function browseType(title: string) { router.push({ path: '/', query: { q: title.split(' ')[0] } }) }
</script>

<template>
  <div class="cm-page">
    <section class="cm-hero">
      <div class="wrap cm-hero-in">
        <nav class="cm-crumb"><NuxtLink to="/">Home</NuxtLink><span>›</span><span>Commercial</span></nav>
        <div class="cm-hero-content">
          <div class="cm-hero-text">
            <span class="cm-eyebrow">🏢 Butuan City · Commercial Real Estate</span>
            <h1>Grow your business in Butuan commercial core.</h1>
            <p>Shophouses, office spaces, warehouses, and prime commercial lots along Butuan City key business corridors — for sale and for lease.</p>
            <div class="cm-hero-cta">
              <button class="btn btn-orange btn-lg" @click="browseCommercial">Browse Commercial Listings →</button>
              <a href="#types" class="btn btn-ghost btn-lg">Property Types ↓</a>
            </div>
          </div>
          <div class="cm-hero-stats">
            <div class="cm-stat"><strong>4</strong><span>Property Types</span></div>
            <div class="cm-stat"><strong>12+</strong><span>Active Listings</span></div>
            <div class="cm-stat"><strong>₱8K</strong><span>Lease from /mo</span></div>
            <div class="cm-stat"><strong>4</strong><span>Key Corridors</span></div>
          </div>
        </div>
      </div>
    </section>

    <section id="types" class="cm-section">
      <div class="wrap">
        <div class="cm-section-head">
          <h2>Commercial Property Types</h2>
          <p>From ground-floor retail to warehouse logistics — explore what is available in Butuan commercial market.</p>
        </div>
        <div class="cm-types">
          <div v-for="t in propertyTypes" :key="t.title" class="cm-type-card">
            <div class="cm-type-icon">{{ t.icon }}</div>
            <h3>{{ t.title }}</h3>
            <p>{{ t.desc }}</p>
            <ul>
              <li v-for="f in t.features" :key="f">✓ {{ f }}</li>
            </ul>
            <div class="cm-type-footer">
              <span class="cm-price-tag">{{ t.avgPrice }}</span>
              <button class="btn btn-navy" @click="browseType(t.title)">Browse →</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cm-section cm-corridor-section">
      <div class="wrap">
        <div class="cm-section-head">
          <h2>Key Business Corridors</h2>
          <p>Location matters. Here are Butuan top commercial strips and what makes each one unique.</p>
        </div>
        <div class="cm-corridors">
          <div v-for="c in corridors" :key="c.name" class="cm-corridor-card">
            <div class="cm-corridor-head">
              <span class="cm-corridor-icon">{{ c.icon }}</span>
              <span class="cm-corridor-tag">{{ c.tag }}</span>
            </div>
            <h4>{{ c.name }}</h4>
            <p>{{ c.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cm-section">
      <div class="wrap">
        <div class="cm-section-head">
          <h2>Why Invest in Butuan?</h2>
          <p>Butuan City is CARAGA regional center — a market on the rise with strong fundamentals for commercial investment.</p>
        </div>
        <div class="cm-reasons">
          <div v-for="r in reasons" :key="r.title" class="cm-reason">
            <div class="cm-reason-icon">{{ r.icon }}</div>
            <h4>{{ r.title }}</h4>
            <p>{{ r.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cm-cta-banner">
      <div class="wrap cm-cta-in">
        <div>
          <h2>Find your commercial space today.</h2>
          <p>Browse all available commercial listings in Butuan City. Filter by type, location, and budget.</p>
        </div>
        <button class="btn btn-orange btn-lg" @click="browseCommercial">Browse Commercial Listings →</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cm-page { background: var(--surface, #f8f9fb); }
.cm-hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #fff; padding: 80px 0 60px; }
.cm-hero-in { position: relative; z-index: 1; }
.cm-crumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.6); margin-bottom: 32px; }
.cm-crumb a { color: rgba(255,255,255,.7); text-decoration: none; }
.cm-crumb a:hover { color: #fff; }
.cm-hero-content { display: flex; flex-wrap: wrap; gap: 48px; align-items: flex-start; }
.cm-hero-text { flex: 1 1 380px; }
.cm-eyebrow { font-size: 13px; font-weight: 600; letter-spacing: .08em; color: #f59e4a; text-transform: uppercase; }
.cm-hero-text h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(1.9rem, 4.5vw, 3rem); font-weight: 800; margin: 12px 0 16px; line-height: 1.15; color: #fff; }
.cm-hero-text p { font-size: 1.05rem; color: rgba(255,255,255,.8); line-height: 1.7; max-width: 520px; }
.cm-hero-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
.cm-hero-stats { display: flex; flex-wrap: wrap; gap: 16px; align-self: center; }
.cm-stat { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); backdrop-filter: blur(8px); border-radius: 16px; padding: 20px 28px; text-align: center; min-width: 110px; }
.cm-stat strong { display: block; font-size: 2rem; font-weight: 800; color: #f59e4a; }
.cm-stat span { font-size: 12px; color: rgba(255,255,255,.7); }
.cm-section { padding: 72px 0; }
.cm-corridor-section { background: #fff; }
.cm-section-head { text-align: center; margin-bottom: 48px; }
.cm-section-head h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: #0b2a4a; margin-bottom: 10px; }
.cm-section-head p { color: #64748b; font-size: 1rem; max-width: 560px; margin: 0 auto; }
.cm-types { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; justify-items: center; }
.cm-type-card { background: #fff; border-radius: 20px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,.06); border: 1px solid #e2e8f0; transition: transform .2s, box-shadow .2s; display: flex; flex-direction: column; width: 100%; max-width: 360px; }
.cm-type-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.1); }
.cm-type-icon { font-size: 2.4rem; margin-bottom: 12px; }
.cm-type-card h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.1rem; font-weight: 800; color: #0b2a4a; margin-bottom: 10px; }
.cm-type-card p { font-size: .9rem; color: #64748b; line-height: 1.6; margin-bottom: 16px; flex: 1; }
.cm-type-card ul { list-style: none; padding: 0; margin-bottom: 20px; display: flex; flex-direction: column; gap: 6px; }
.cm-type-card li { font-size: .85rem; color: #475569; }
.cm-type-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 16px; }
.cm-price-tag { font-size: .8rem; font-weight: 700; color: #0b2a4a; background: #f1f5f9; padding: 4px 10px; border-radius: 50px; }
.cm-corridors { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
.cm-corridor-card { background: #f8f9fb; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; transition: border-color .2s; width: 260px; flex: 0 1 260px; }
.cm-corridor-card:hover { border-color: #0b2a4a; }
.cm-corridor-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.cm-corridor-icon { font-size: 1.8rem; }
.cm-corridor-tag { font-size: 11px; font-weight: 700; color: #e05a1a; background: #fff3ed; padding: 3px 10px; border-radius: 50px; }
.cm-corridor-card h4 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; color: #0b2a4a; margin-bottom: 8px; }
.cm-corridor-card p { font-size: .85rem; color: #64748b; line-height: 1.6; }
.cm-reasons { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
.cm-reason { background: #fff; border-radius: 16px; padding: 28px 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,.05); width: 240px; flex: 0 1 240px; }
.cm-reason-icon { font-size: 2.2rem; margin-bottom: 12px; }
.cm-reason h4 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; color: #0b2a4a; margin-bottom: 8px; }
.cm-reason p { font-size: .85rem; color: #64748b; line-height: 1.6; }
.cm-cta-banner { background: linear-gradient(135deg, #1a1a2e, #0f3460); padding: 64px 0; }
.cm-cta-in { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; }
.cm-cta-banner h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; color: #fff; margin-bottom: 8px; }
.cm-cta-banner p { color: rgba(255,255,255,.75); font-size: .95rem; }
</style>
