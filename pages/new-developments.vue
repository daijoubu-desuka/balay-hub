<script setup lang="ts">
useHead({
  title: 'New Developments in Butuan | BahayHub',
  meta: [{ name: 'description', content: 'Explore new real estate developments in Butuan City — master-planned communities, pre-selling condos, and subdivision projects.' }]
})

const router = useRouter()
// stock photography (Unsplash); a navy panel shows if one fails to load
const U = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`
const hide = (e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')

const developments = [
  {
    id: 'nd1', name: 'Baan Riverside Residences', developer: 'Mindanao Homes Corp.',
    location: 'Baan Riverside, Butuan City', type: 'Master-planned subdivision', img: U('photo-1564013799919-ab600027ffc6'),
    units: 240, phase: 'Phase 2 · Pre-selling', price: 3.2, completion: 'Q4 2026', status: 'Pre-selling', hot: true,
    features: ['Guarded entrance', 'Clubhouse and pool', 'Green parks', 'Underground drainage'],
    description: 'A master-planned riverside community offering 240 lots and house-and-lot packages. Phase 1 is sold out; Phase 2 is open for reservation.'
  },
  {
    id: 'nd2', name: 'J.C. Aquino Executive Lofts', developer: 'Northgate Realty',
    location: 'J.C. Aquino Avenue, Butuan City', type: 'Mid-rise condominium', img: U('photo-1545324418-cc1a3fa10c00'),
    units: 120, phase: 'Phase 1 · Turnover', price: 2.8, completion: 'Ready now', status: 'Ready for occupancy', hot: false,
    features: ['24/7 CCTV', 'Rooftop lounge', 'Backup generator', 'Smart door locks'],
    description: "Butuan's first mid-rise executive lofts on the city's commercial corridor. Studio to 2-bedroom units, fully fitted."
  },
  {
    id: 'nd3', name: 'Villa Kananga Heights', developer: 'SunEast Properties',
    location: 'Villa Kananga, Butuan City', type: 'Affordable subdivision', img: U('photo-1568605114967-8130f3a36994'),
    units: 380, phase: 'Phase 3 · Open lots', price: 1.1, completion: 'Q2 2027', status: 'Pre-selling', hot: false,
    features: ['Concrete road network', 'Solar street lights', "Children's playground", 'Community hall'],
    description: 'Affordable house-and-lot packages in one of Butuan’s fastest-growing residential zones. Built for first-time owners and OFW investors.'
  }
]
const stats = [
  { v: String(developments.length), l: 'Active projects' },
  { v: developments.reduce((n, d) => n + d.units, 0).toLocaleString() + ' units', l: 'Across all phases' },
  { v: '₱' + Math.min(...developments.map(d => d.price)) + 'M', l: 'Starting price' },
  { v: String(developments.filter(d => d.completion === 'Ready now').length), l: 'Ready for occupancy' }
]

const phases = [
  { title: 'Reservation', desc: 'Secure your unit with a reservation fee and lock in the pre-selling price.' },
  { title: 'Documentation', desc: 'Submit income documents, sign the Contract to Sell and arrange financing.' },
  { title: 'Payment', desc: 'Choose in-house, bank or Pag-IBIG financing. Monthly amortization begins.' },
  { title: 'Turnover', desc: 'Inspect the unit, transfer the title and receive your keys on completion.' }
]

const faqs = [
  { q: 'What is a pre-selling property?', a: 'Pre-selling means the development is not yet built or is still under construction. You buy at a lower price but wait for completion, typically 1 to 3 years.' },
  { q: 'Can OFWs purchase a pre-selling unit?', a: 'Yes. OFWs can use the Pag-IBIG Overseas Program or bank financing. A Special Power of Attorney is required for remote transactions.' },
  { q: 'Is a reservation fee refundable?', a: 'Reservation fees are generally non-refundable. Always read the Contract to Sell carefully before signing and paying.' },
  { q: "How do I verify a developer's license?", a: "Check the DHSUD (formerly HLURB) online portal for the developer's license to sell and the project registration." }
]

const activeFaq = ref<number | null>(0)
function browseAll() { router.push('/browse') }
function browseItem(name: string) { router.push({ path: '/browse', query: { q: name.split(' ').slice(0, 2).join(' ') } }) }
</script>

<template>
  <div class="ph-page">
    <section class="ph-hero">
      <img :src="U('photo-1600585154340-be6161a56a0c', 1800)" alt="" fetchpriority="high" @error="hide" />
      <div class="wrap ph-hero-in">
        <nav class="ph-crumb" aria-label="Breadcrumb"><NuxtLink to="/">Home</NuxtLink><span>/</span><span>New Developments</span></nav>
        <p class="ph-eyebrow">New developments · Butuan City</p>
        <h1>Own a piece of Butuan’s future.</h1>
        <p>Master-planned riverside communities, mid-rise executive lofts and affordable subdivisions — pre-selling and ready-for-occupancy projects shaping the city.</p>
        <div class="ph-hero-cta">
          <a href="#projects" class="btn btn-orange btn-lg">View projects</a>
          <button class="btn btn-lg ph-btn-glass" @click="browseAll">Browse all listings →</button>
        </div>
      </div>
    </section>

    <div class="wrap">
      <div class="ph-stats">
        <div v-for="s in stats" :key="s.l"><b>{{ s.v }}</b><span>{{ s.l }}</span></div>
      </div>
    </div>

    <section id="projects" class="ph-section" style="scroll-margin-top:80px">
      <div class="wrap">
        <div class="ph-head">
          <div>
            <p class="ph-kicker">Featured developments</p>
            <h2>Projects open for reservation</h2>
            <p>Pre-selling and ready-for-occupancy projects across Butuan City. Prices and availability are reviewed monthly.</p>
          </div>
        </div>
        <div class="ph-grid3">
          <article v-for="(d, i) in developments" :key="d.id" v-reveal="i" class="ph-card">
            <div class="ph-media">
              <img :src="d.img" :alt="`${d.name}, ${d.type.toLowerCase()} in ${d.location}`" loading="lazy" @error="hide" />
              <div class="ph-chips">
                <span class="ph-chip" :class="d.completion === 'Ready now' ? 'ok' : ''">{{ d.status }}</span>
                <span v-if="d.hot" class="ph-chip hot">Selling fast</span>
              </div>
              <div class="ph-on-photo"><small>Units from</small><b>₱{{ d.price }}M</b></div>
            </div>
            <div class="ph-body">
              <p class="ph-dev">{{ d.developer }}</p>
              <h3>{{ d.name }}</h3>
              <p class="ph-loc"><Icon name="pin" />{{ d.location }}</p>
              <p class="ph-desc">{{ d.description }}</p>
              <dl class="ph-facts">
                <div><dt>Type</dt><dd>{{ d.type }}</dd></div>
                <div><dt>Units</dt><dd>{{ d.units }}</dd></div>
                <div><dt>Phase</dt><dd>{{ d.phase }}</dd></div>
                <div><dt>Completion</dt><dd>{{ d.completion }}</dd></div>
              </dl>
              <ul class="ph-feats">
                <li v-for="f in d.features" :key="f"><Icon name="check" />{{ f }}</li>
              </ul>
              <div class="ph-foot">
                <span class="x-muted">{{ d.units }} units · {{ d.phase.split(' · ')[1] }}</span>
                <button class="btn btn-navy" @click="browseItem(d.name)">See listings →</button>
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
            <p class="ph-kicker">The buying process</p>
            <h2>How pre-selling works</h2>
            <p>Four steps from reservation to key handover.</p>
          </div>
        </div>
        <ol class="ph-steps" style="list-style:none;padding:0">
          <li v-for="(p, i) in phases" :key="p.title" v-reveal="i" class="ph-step">
            <em>Step 0{{ i + 1 }}</em>
            <h4>{{ p.title }}</h4>
            <p>{{ p.desc }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="ph-section">
      <div class="wrap ph-faq">
        <div class="ph-head" style="margin:0">
          <div>
            <p class="ph-kicker">Good to know</p>
            <h2>Questions buyers ask</h2>
            <p>Common questions about pre-selling and new developments in Butuan.</p>
          </div>
        </div>
        <div class="ph-faq-list">
          <div v-for="(f, i) in faqs" :key="f.q" class="ph-faq-item" :class="{ open: activeFaq === i }">
            <button class="ph-faq-q" :aria-expanded="activeFaq === i" @click="activeFaq = activeFaq === i ? null : i">
              {{ f.q }}<span aria-hidden="true">+</span>
            </button>
            <Transition name="err"><p v-if="activeFaq === i" class="ph-faq-a">{{ f.a }}</p></Transition>
          </div>
        </div>
      </div>
    </section>

    <section class="ph-cta">
      <img :src="U('photo-1600607687939-ce8a6c25118c', 1800)" alt="" loading="lazy" @error="hide" />
      <div class="wrap ph-cta-in">
        <div>
          <h2>Ready to reserve your unit?</h2>
          <p>Browse every available listing, filter by budget and location, and send a viewing request to a verified agent.</p>
        </div>
        <button class="btn btn-orange btn-lg" @click="browseAll">Browse all listings →</button>
      </div>
    </section>
  </div>
</template>
