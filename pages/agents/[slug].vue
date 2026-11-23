<script setup lang="ts">
const route = useRoute()
const store = usePropertyStore()
await useAsyncData('properties', async () => { await store.load(); return true })

const auth = useAuthStore()
const ids = useIdCheckStore()
const reviews = useReviewStore()
const ui = useUiStore()
const face = useFace()
const agents = useAgents()
const messageAgent = useMessageAgent()

const a = computed(() => agents.value.find(x => x.slug === route.params.slug))
useHead({ title: computed(() => (a.value ? `${a.value.name} · Agent | BahayHub Butuan` : 'Agent not found | BahayHub')) })
const st = computed(() => (a.value ? reviews.stats(a.value.name) : null))
const list = computed(() => (a.value ? reviews.forAgent(a.value.name) : []))
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('')
const listingFilter = ref<'all' | 'sale' | 'rent'>('all')
const listings = computed(() => (a.value?.listings ?? []).filter(l => listingFilter.value === 'all' || l.listing === listingFilter.value))

// --- write a review: signed-in, ID-verified clients only
const isClient = computed(() => auth.user?.role === 'client')
const canReview = computed(() => isClient.value && ids.isVerified(auth.user!.id))
const mine = computed(() => list.value.find(r => r.authorId === auth.user?.id))
const form = reactive({ rating: 0, text: '', deal: 'Viewing only' })
const touched = ref(false)
const open = ref(false)
watch(mine, m => { if (m) Object.assign(form, { rating: m.rating, text: m.text, deal: m.deal }) }, { immediate: true })
const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!form.rating) e.rating = 'Choose 1 to 5 stars.'
  if (form.text.trim().length < 20) e.text = 'Write at least 20 characters about your experience.'
  else if (form.text.length > 500) e.text = 'Keep it under 500 characters.'
  return e
})
function submit() {
  touched.value = true
  if (Object.keys(errors.value).length || !a.value || !auth.user) { ui.toast('Please fix the highlighted fields.', 'error'); return }
  const isNew = reviews.write(a.value.name, auth.user, form.rating, form.text, form.deal)
  ui.toast(isNew ? 'Thanks! Your review is posted.' : 'Your review is updated.', 'success')
  touched.value = false; open.value = false
}
const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
const hide = (e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')
</script>

<template>
  <div class="ph-page">
    <div v-if="!a && store.loaded" class="wrap empty" style="margin:60px auto">
      <Icon name="user" /><h2>We couldn’t find that agent</h2>
      <NuxtLink to="/agents" class="btn btn-navy">Back to all agents</NuxtLink>
    </div>
    <div v-else-if="!a" class="wrap" style="padding:40px 0"><div class="skeleton" style="height:320px;border-radius:24px" /></div>

    <template v-else>
      <section class="x-prof-cover">
        <img src="https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1920&q=80" alt="" @error="hide" />
      </section>

      <div class="wrap">
        <div class="x-prof-head">
          <div class="x-profile-photo x-prof-face">
            <img v-if="face(a.id)" :src="face(a.id)" :alt="`Photo of ${a.name}`" />
            <span v-else aria-hidden="true">{{ initials(a.name) }}</span>
          </div>
          <div class="x-prof-id">
            <nav class="crumbs" aria-label="Breadcrumb"><NuxtLink to="/agents">Find an Agent</NuxtLink><span>/</span><span>{{ a.name }}</span></nav>
            <h1>{{ a.name }}</h1>
            <p class="x-muted" style="font-size:14px">{{ a.title }}</p>
            <div class="x-prof-badges">
              <VerifiedBadge v-if="a.verified" />
              <span v-else class="x-pill pending">PRC verification pending</span>
              <Stars :value="a.rating" :count="a.reviewCount" />
            </div>
          </div>
          <div class="x-prof-actions">
            <button v-if="a.accountId && (!auth.user || isClient)" class="btn btn-orange" @click="messageAgent(null, a.accountId)"><Icon name="chat" /> Message {{ a.name.split(' ')[0] }}</button>
            <NuxtLink v-else-if="a.listings.length" :to="`/property/${a.listings[0].id}`" class="btn btn-orange" title="This agent takes requests through their listings"><Icon name="calendar" /> Request a viewing</NuxtLink>
            <a href="#listings" class="btn btn-ghost">See {{ a.listings.length }} listing{{ a.listings.length === 1 ? '' : 's' }}</a>
          </div>
        </div>

        <dl class="ph-stats x-prof-stats">
          <div><dt>Rating</dt><dd>{{ a.rating ? a.rating.toFixed(1) + ' / 5' : 'New' }}</dd></div>
          <div><dt>Active listings</dt><dd>{{ a.listings.length }}</dd></div>
          <div><dt>Closed deals</dt><dd>{{ a.closed }}</dd></div>
          <div><dt>Experience</dt><dd>{{ a.years ? a.years + ' years' : '—' }}</dd></div>
        </dl>

        <div class="x-prof-grid">
          <div style="display:grid;gap:20px;min-width:0">
            <section class="ws-card">
              <p class="ws-card-eyebrow">About</p>
              <p class="ph-desc" style="margin-top:6px">{{ a.about }}</p>
              <p class="ws-card-eyebrow" style="margin-top:18px">Areas served</p>
              <div class="x-chips" style="margin-top:6px"><span v-for="ar in a.areas" :key="ar" class="ph-chip" style="background:var(--chip)">{{ ar }}</span></div>
            </section>

            <section id="listings" class="ws-card" style="scroll-margin-top:90px">
              <div class="ws-card-header">
                <div><p class="ws-card-eyebrow">Listings</p><h2 class="ws-card-title" style="font-size:20px">Properties by {{ a.name.split(' ')[0] }}</h2></div>
                <div class="seg" role="group" aria-label="Filter listings">
                  <button v-for="f in (['all', 'sale', 'rent'] as const)" :key="f" type="button" :aria-pressed="listingFilter === f" @click="listingFilter = f">{{ f === 'all' ? 'All' : f === 'sale' ? 'For sale' : 'For rent' }}</button>
                </div>
              </div>
              <div v-if="listings.length" class="grid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">
                <PropertyCard v-for="p in listings" :key="p.id" :item="p" />
              </div>
              <p v-else class="x-empty">No {{ listingFilter === 'all' ? '' : listingFilter === 'sale' ? 'for-sale ' : 'for-rent ' }}listings right now.</p>
            </section>
          </div>

          <aside style="display:grid;gap:20px;align-content:start">
            <section class="ws-card">
              <p class="ws-card-eyebrow">PRC license</p>
              <dl class="x-dl" style="margin-top:8px">
                <div><dt>Status</dt><dd>{{ a.verified ? 'Verified by BahayHub' : a.status }}</dd></div>
                <div><dt>Type</dt><dd>{{ a.licenseType }}</dd></div>
                <div v-if="a.cred"><dt>License no.</dt><dd>{{ maskPrc(a.cred.prcLicenseNo) }}</dd></div>
                <div v-if="a.cred"><dt>Valid until</dt><dd>{{ fmtMonth(a.cred.expiryDate) }}</dd></div>
                <div v-if="a.cred?.broker"><dt>Supervising broker</dt><dd>{{ a.cred.broker }}</dd></div>
              </dl>
              <p class="x-muted" style="font-size:12px;margin-top:10px">License numbers are partly hidden. Verification is done by a BahayHub admin, not the PRC.</p>
            </section>

            <section v-if="st" class="ws-card">
              <p class="ws-card-eyebrow">Client rating</p>
              <div class="x-rate-big"><b>{{ st.avg ? st.avg.toFixed(1) : '—' }}</b><Stars :value="st.avg" :count="st.count" /></div>
              <div v-for="b in st.bars" :key="b.st" class="x-rate-row">
                <span>{{ b.st }}★</span><span class="x-lead-bar"><i :style="{ width: (st.count ? (b.n / st.count) * 100 : 0) + '%' }" /></span><small>{{ b.n }}</small>
              </div>
            </section>
          </aside>
        </div>

        <section class="ws-card" style="margin:20px 0 60px">
          <div class="ws-card-header">
            <div><p class="ws-card-eyebrow">Reviews</p><h2 class="ws-card-title" style="font-size:20px">What clients say</h2></div>
            <button v-if="canReview && !open" class="btn btn-orange btn-sm" @click="open = true">{{ mine ? 'Edit your review' : 'Write a review' }}</button>
          </div>

          <p v-if="!auth.user" class="x-muted" style="margin-bottom:12px"><NuxtLink :to="{ path: '/login', query: { redirect: route.fullPath } }" class="ws-link-btn">Log in</NuxtLink> as a verified client to write a review.</p>
          <p v-else-if="isClient && !canReview" class="x-muted" style="margin-bottom:12px">Only clients with a verified ID can write reviews. <NuxtLink to="/account#idcheck" class="ws-link-btn">Check your ID status →</NuxtLink></p>

          <Transition name="err">
            <form v-if="open" class="x-review-form" novalidate @submit.prevent="submit">
              <div class="form-row">
                <span id="rv-rate-l" style="font-weight:600;font-size:13.5px">Your rating</span>
                <div class="x-rate-pick" role="radiogroup" aria-labelledby="rv-rate-l">
                  <button v-for="n in 5" :key="n" type="button" role="radio" :aria-checked="form.rating === n" :aria-label="`${n} star${n === 1 ? '' : 's'}`" :class="{ on: n <= form.rating }" @click="form.rating = n">★</button>
                </div>
                <p v-if="touched && errors.rating" class="err" role="alert">{{ errors.rating }}</p>
              </div>
              <div class="form-row"><label for="rv-deal">What did you do with {{ a.name.split(' ')[0] }}?</label>
                <select id="rv-deal" v-model="form.deal" class="input"><option>Viewing only</option><option>Bought a property</option><option>Rented a property</option><option>Leased a commercial space</option></select></div>
              <div class="form-row"><label for="rv-text">Your review</label>
                <textarea id="rv-text" v-model="form.text" class="input" rows="4" style="height:auto;padding:10px 14px" :aria-invalid="touched && !!errors.text" />
                <small class="x-muted">{{ form.text.length }}/500</small>
                <p v-if="touched && errors.text" class="err" role="alert">{{ errors.text }}</p></div>
              <div style="display:flex;gap:10px"><button class="btn btn-orange">Post review</button><button type="button" class="btn btn-ghost" @click="open = false">Cancel</button></div>
            </form>
          </Transition>

          <ul v-if="list.length" class="x-reviews">
            <li v-for="r in list" :key="r.id">
              <div class="x-review-top"><span class="x-ava x-ava-ph">{{ r.author[0] }}</span><span><b>{{ r.author }}</b><small>{{ r.deal }} · {{ fmt(r.date) }}</small></span><Stars :value="r.rating" small /></div>
              <p>{{ r.text }}</p>
            </li>
          </ul>
          <p v-else class="x-empty">No reviews yet.</p>
        </section>
      </div>
    </template>
  </div>
</template>
