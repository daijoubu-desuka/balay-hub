<script setup lang="ts">
useHead({
  title: 'New Developments in Butuan | BahayHub',
  meta: [{ name: 'description', content: 'Explore new real estate developments in Butuan City — master-planned communities, pre-selling condos, and subdivision projects.' }]
})

const router = useRouter()

const developments = [
  {
    id: 'nd1', name: 'Baan Riverside Residences', developer: 'Mindanao Homes Corp.',
    location: 'Baan Riverside, Butuan City', type: 'Master-planned Subdivision',
    units: 240, phase: 'Phase 2 – Pre-selling', priceFrom: '₱3.2M', completion: 'Q4 2026',
    badge: 'Pre-selling', badgeColor: '#e05a1a', tag: 'HOT', color: '#0b2a4a',
    features: ['Guarded entrance', 'Clubhouse & pool', 'Green parks', 'Underground drainage'],
    description: 'A master-planned riverside community offering 240 lots and house-and-lot packages. Phase 1 is fully sold out — Phase 2 now open for reservation.'
  },
  {
    id: 'nd2', name: 'J.C. Aquino Executive Lofts', developer: 'Northgate Realty',
    location: 'J.C. Aquino Avenue, Butuan City', type: 'Condominium – Mid-rise',
    units: 120, phase: 'Phase 1 – Ready for Occupancy', priceFrom: '₱2.8M', completion: 'Ready Now',
    badge: 'RFO', badgeColor: '#16a34a', tag: 'NEW', color: '#1a3a5c',
    features: ['24/7 CCTV', 'Rooftop lounge', 'Backup generator', 'Smart door locks'],
    description: "Butuan's first mid-rise executive loft development along the city's commercial corridor. Studio to 2-bedroom units, fully fitted."
  },
  {
    id: 'nd3', name: 'Villa Kananga Heights', developer: 'SunEast Properties',
    location: 'Villa Kananga, Butuan City', type: 'Subdivision – Affordable',
    units: 380, phase: 'Phase 3 – Open Lots', priceFrom: '₱1.1M', completion: 'Q2 2027',
    badge: 'Pre-selling', badgeColor: '#e05a1a', tag: null, color: '#2d1b69',
    features: ['Concrete road network', 'Solar street lights', "Children's playground", 'Community hall'],
    description: "Affordable house-and-lot packages in one of Butuan's fastest-growing residential zones. Ideal for first-time homeowners and OFW investors."
  }
]

const phases = [
  { icon: '📋', title: 'Reservation', desc: 'Secure your unit with a reservation fee and lock in the pre-selling price.' },
  { icon: '📝', title: 'Documentation', desc: 'Submit income docs, sign the Contract to Sell, and arrange financing.' },
  { icon: '💳', title: 'Payment', desc: 'Choose in-house, bank, or Pag-IBIG financing. Monthly amortization begins.' },
  { icon: '🏠', title: 'Turnover', desc: 'Property inspection, title transfer, and key handover upon completion.' }
]

const faqs = [
  { q: 'What is a pre-selling property?', a: 'Pre-selling means the development is not yet built or is still under construction. You buy at a lower price but wait for completion — typically 1–3 years.' },
  { q: 'Can OFWs purchase a pre-selling unit?', a: 'Yes. OFWs can use Pag-IBIG Overseas Program (POP) or bank financing. A Special Power of Attorney (SPA) is required for remote transactions.' },
  { q: 'Is a reservation fee refundable?', a: 'Reservation fees are generally non-refundable. Always read the Contract to Sell carefully before signing and paying.' },
  { q: "How do I verify a developer's license?", a: "Check the HLURB (now DHSUD) online portal for the developer's license to sell and project registration." }
]

const activeFaq = ref<number | null>(null)
function toggleFaq(i: number) { activeFaq.value = activeFaq.value === i ? null : i }
function browseAll() { router.push('/') }
function browseItem(name: string) { router.push({ path: '/', query: { q: name.split(' ').slice(0, 2).join(' ') } }) }
</script>

<template>
  <div class="nd-page">

    <!-- HERO -->
    <section class="nd-hero">
      <div class="wrap nd-hero-in">
        <nav class="nd-crumb"><NuxtLink to="/">Home</NuxtLink><span>›</span><span>New Developments</span></nav>
        <div class="nd-hero-content">
          <div class="nd-hero-text">
            <span class="nd-eyebrow">🏗️ Butuan City · New Developments</span>
            <h1>Own a piece of Butuan's future.</h1>
            <p>From master-planned riverside communities to mid-rise executive condos — discover pre-selling and ready-for-occupancy developments shaping Butuan City.</p>
            <div class="nd-hero-cta">
              <button class="btn btn-orange btn-lg" @click="browseAll">Browse All Listings →</button>
              <a href="#projects" class="btn btn-ghost btn-lg">View Projects ↓</a>
            </div>
          </div>
          <div class="nd-hero-stats">
            <div class="nd-stat"><strong>3</strong><span>Active Projects</span></div>
            <div class="nd-stat"><strong>740+</strong><span>Total Units</span></div>
            <div class="nd-stat"><strong>₱1.1M</strong><span>Starting Price</span></div>
            <div class="nd-stat"><strong>2</strong><span>RFO Available</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- PROJECTS -->
    <section id="projects" class="nd-section">
      <div class="wrap">
        <div class="nd-section-head">
          <h2>Featured Developments</h2>
          <p>Pre-selling and ready-for-occupancy projects across Butuan City. Prices and availability are updated monthly.</p>
        </div>
        <div class="nd-projects">
          <article v-for="dev in developments" :key="dev.id" class="nd-project-card">
            <div class="nd-project-top" :style="{ background: dev.color }">
              <div class="nd-project-badge" :style="{ background: dev.badgeColor }">{{ dev.badge }}</div>
              <div v-if="dev.tag" class="nd-project-tag">{{ dev.tag }}</div>
              <div class="nd-project-icon">🏘️</div>
            </div>
            <div class="nd-project-body">
              <p class="nd-project-dev">{{ dev.developer }}</p>
              <h3>{{ dev.name }}</h3>
              <p class="nd-project-desc">{{ dev.description }}</p>
              <div class="nd-project-meta">
                <div><span>📍</span> {{ dev.location }}</div>
                <div><span>🏗️</span> {{ dev.type }}</div>
                <div><span>🏠</span> {{ dev.units }} units · {{ dev.phase }}</div>
                <div><span>📅</span> Completion: {{ dev.completion }}</div>
              </div>
              <ul class="nd-project-features">
                <li v-for="f in dev.features" :key="f">✓ {{ f }}</li>
              </ul>
              <div class="nd-project-footer">
                <div class="nd-project-price">From <strong>{{ dev.priceFrom }}</strong></div>
                <button class="btn btn-navy" @click="browseItem(dev.name)">Browse listings →</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- BUYING PROCESS -->
    <section class="nd-section nd-process-section">
      <div class="wrap">
        <div class="nd-section-head">
          <h2>How Pre-Selling Works</h2>
          <p>Four steps from reservation to key handover.</p>
        </div>
        <div class="nd-phases">
          <div v-for="(phase, i) in phases" :key="i" class="nd-phase">
            <div class="nd-phase-icon">{{ phase.icon }}</div>
            <div class="nd-phase-num">0{{ i + 1 }}</div>
            <h4>{{ phase.title }}</h4>
            <p>{{ phase.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="nd-section">
      <div class="wrap nd-faq-wrap">
        <div class="nd-section-head">
          <h2>Frequently Asked Questions</h2>
          <p>Common questions about buying pre-selling and new development properties in Butuan.</p>
        </div>
        <div class="nd-faq">
          <div v-for="(item, i) in faqs" :key="i" class="nd-faq-item" :class="{ open: activeFaq === i }">
            <button class="nd-faq-q" @click="toggleFaq(i)">
              {{ item.q }}<span class="nd-faq-icon">{{ activeFaq === i ? '−' : '+' }}</span>
            </button>
            <Transition name="faq">
              <p v-if="activeFaq === i" class="nd-faq-a">{{ item.a }}</p>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="nd-cta-banner">
      <div class="wrap nd-cta-in">
        <div>
          <h2>Ready to reserve your unit?</h2>
          <p>Browse all available listings, filter by budget and location, and send an inquiry to our agents.</p>
        </div>
        <button class="btn btn-orange btn-lg" @click="browseAll">Browse All Listings →</button>
      </div>
    </section>

  </div>
</template>

<style scoped>
.nd-page { background: var(--surface, #f8f9fb); }
.nd-hero { background: linear-gradient(135deg, #0b2a4a 0%, #1a4a7a 60%, #0f3560 100%); color: #fff; padding: 80px 0 60px; }
.nd-hero-in { position: relative; z-index: 1; }
.nd-crumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.6); margin-bottom: 32px; }
.nd-crumb a { color: rgba(255,255,255,.7); text-decoration: none; }
.nd-crumb a:hover { color: #fff; }
.nd-hero-content { display: flex; flex-wrap: wrap; gap: 48px; align-items: flex-start; }
.nd-hero-text { flex: 1 1 380px; }
.nd-eyebrow { font-size: 13px; font-weight: 600; letter-spacing: .08em; color: #f59e4a; text-transform: uppercase; }
.nd-hero-text h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; margin: 12px 0 16px; line-height: 1.1; color: #fff; }
.nd-hero-text p { font-size: 1.05rem; color: rgba(255,255,255,.8); line-height: 1.7; max-width: 520px; }
.nd-hero-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
.nd-hero-stats { display: flex; flex-wrap: wrap; gap: 16px; align-self: center; }
.nd-stat { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); backdrop-filter: blur(8px); border-radius: 16px; padding: 20px 28px; text-align: center; min-width: 110px; }
.nd-stat strong { display: block; font-size: 2rem; font-weight: 800; color: #f59e4a; }
.nd-stat span { font-size: 12px; color: rgba(255,255,255,.7); }
.nd-section { padding: 72px 0; }
.nd-process-section { background: #fff; }
.nd-section-head { text-align: center; margin-bottom: 48px; }
.nd-section-head h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: #0b2a4a; margin-bottom: 10px; }
.nd-section-head p { color: #64748b; font-size: 1rem; max-width: 560px; margin: 0 auto; }
.nd-projects { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px; justify-items: center; }
.nd-project-card { background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.07); transition: transform .2s, box-shadow .2s; width: 100%; max-width: 400px; }
.nd-project-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.12); }
.nd-project-top { position: relative; height: 160px; display: flex; align-items: center; justify-content: center; }
.nd-project-icon { font-size: 4rem; opacity: .5; }
.nd-project-badge { position: absolute; top: 16px; left: 16px; font-size: 11px; font-weight: 700; color: #fff; padding: 4px 12px; border-radius: 50px; letter-spacing: .06em; text-transform: uppercase; }
.nd-project-tag { position: absolute; top: 16px; right: 16px; background: #fff; color: #e05a1a; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 50px; }
.nd-project-body { padding: 24px; }
.nd-project-dev { font-size: 12px; font-weight: 600; color: #e05a1a; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
.nd-project-body h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.2rem; font-weight: 800; color: #0b2a4a; margin-bottom: 10px; }
.nd-project-desc { font-size: .9rem; color: #64748b; line-height: 1.6; margin-bottom: 16px; }
.nd-project-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.nd-project-meta div { font-size: .85rem; color: #475569; display: flex; gap: 8px; }
.nd-project-features { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; margin-bottom: 20px; }
.nd-project-features li { font-size: .8rem; background: #f1f5f9; color: #0b2a4a; padding: 4px 10px; border-radius: 50px; font-weight: 500; }
.nd-project-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 16px; }
.nd-project-price { font-size: .85rem; color: #64748b; }
.nd-project-price strong { color: #0b2a4a; font-size: 1.1rem; }
.nd-phases { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
.nd-phase { background: #f8f9fb; border-radius: 16px; padding: 28px 20px; text-align: center; border: 1px solid #e2e8f0; position: relative; width: 220px; flex: 0 1 220px; }
.nd-phase-icon { font-size: 2.4rem; margin-bottom: 8px; }
.nd-phase-num { position: absolute; top: 16px; right: 16px; font-size: 11px; font-weight: 800; color: #cbd5e1; }
.nd-phase h4 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; color: #0b2a4a; margin-bottom: 8px; }
.nd-phase p { font-size: .85rem; color: #64748b; line-height: 1.6; }
.nd-faq-wrap { max-width: 720px; margin: 0 auto; }
.nd-faq { display: flex; flex-direction: column; gap: 12px; }
.nd-faq-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
.nd-faq-item.open { border-color: #0b2a4a; }
.nd-faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; background: none; border: none; cursor: pointer; font-size: .95rem; font-weight: 600; color: #0b2a4a; text-align: left; }
.nd-faq-icon { font-size: 1.4rem; color: #e05a1a; flex-shrink: 0; }
.nd-faq-a { padding: 0 20px 18px; font-size: .9rem; color: #475569; line-height: 1.7; }
.faq-enter-active, .faq-leave-active { transition: opacity .2s, transform .2s; }
.faq-enter-from, .faq-leave-to { opacity: 0; transform: translateY(-6px); }
.nd-cta-banner { background: linear-gradient(135deg, #e05a1a, #f59e4a); padding: 64px 0; }
.nd-cta-in { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; }
.nd-cta-banner h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; color: #fff; margin-bottom: 8px; }
.nd-cta-banner p { color: rgba(255,255,255,.85); font-size: .95rem; }
</style>
