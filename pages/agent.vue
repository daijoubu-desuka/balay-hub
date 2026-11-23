<script setup lang="ts">
import type { Role } from '~/stores/auth'

definePageMeta({ middleware: 'auth', ssr: false })
useHead({ title: 'Agent Workspace | BahayHub Butuan' })

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()
const pay = usePaymentStore()
const creds = useCredentialStore()
const msgStore = useMessageStore()

// Guard agent workspace
watch(() => auth.user, u => {
  if (u && u.role !== 'agent') router.replace('/account')
  if (!u) router.replace('/login?role=agent')
}, { immediate: true })

const baseTabs = [
  { id: 'overview',     label: 'Overview' },
  { id: 'requests',     label: 'Assigned requests', badge: 1 },
  { id: 'appointments', label: 'Appointments' },
  { id: 'deals',        label: 'My deals' },
  { id: 'commission',   label: 'My commission' },
  { id: 'analytics',    label: 'Analytics' },
  { id: 'verification', label: 'Verification' },
  { id: 'messages',     label: 'Messages' },
  { id: 'listings',     label: 'Listings' },
  { id: 'offers',       label: 'Offers' },
  { id: 'profile',      label: 'Profile' },
]
const pendingDeals = computed(() => pay.items.filter(p => p.agent === auth.user?.name && p.status === 'Pending').length)
const unreadMsgs = computed(() => msgStore.unread(auth.user))
const tabs = computed(() => baseTabs.map(t => t.id === 'deals' ? { ...t, badge: pendingDeals.value } : t.id === 'messages' ? { ...t, badge: unreadMsgs.value } : t))
const statFor = ref<{ l: AgentListing; kind: 'views' | 'inquiries' } | null>(null)
const activeTab = ref(baseTabs.some(t => t.id === route.query.tab) ? String(route.query.tab) : 'overview')
// notification links (/agent?tab=...) switch tabs even when this page is already open
watch(() => route.query.tab, t => {
  if (!baseTabs.some(x => x.id === t) || activeTab.value === t) return
  activeTab.value = String(t)
  if (!route.query.focus) window.scrollTo({ top: 0, behavior: 'smooth' }) // a focused row scrolls itself into view
})
// clicking a tab writes it to the URL, so a notification that links to any tab is always a real navigation
watch(activeTab, t => { if (route.query.tab !== t) router.replace({ query: { tab: t } }) })

const HERO: Record<string, [string, string]> = {
  deals: ['Track your sales and rentals', 'Record every deal and follow its commission from Pending to Paid.'],
  commission: ['Track your sales and rentals', 'Commission is 10% of paid sales and rent deals.'],
  analytics: ['Sales analytics', 'Your paid sales and closed deals, week by week and month by month.'],
  verification: ['Get PRC verified', 'Submit your PRC license so an admin can verify you and unlock listings.'],
  profile: ['Your profile', 'Your photo and details as clients and admins see them.'],
  messages: ['Messages', 'Talk with clients and admins. Conversations stay in this browser.']
}
const heroTitle = computed(() => HERO[activeTab.value]?.[0] ?? `${greeting}, ${firstName.value}.`)
const heroSub = computed(() => HERO[activeTab.value]?.[1] ?? 'Manage assigned client inquiries, property listings, viewing schedules, and client offers in one place.')
const verified = computed(() => !!auth.user && creds.isVerified(auth.user.id))
// ---- Overview summary
const myPays = computed(() => pay.items.filter(p => p.agent === auth.user?.name))
const myMoney = computed(() => totals(myPays.value))
const mySold = computed(() => paidSales(myPays.value))
const overviewKpis = computed(() => [
  { l: 'Commission earned', v: myMoney.value.earned, s: 'From deals marked Paid', i: 'cash', o: true, to: '/agent?tab=commission' },
  { l: 'Commission pending', v: myMoney.value.pendingCommission, s: `${pendingDeals.value} deal${pendingDeals.value === 1 ? '' : 's'} waiting for admin approval`, i: 'clock', to: '/agent?tab=deals' },
  { l: 'Paid sales', v: mySold.value.reduce((n, p) => n + p.amount, 0), s: `${mySold.value.length} closed sale${mySold.value.length === 1 ? '' : 's'}`, i: 'building', to: '/agent?tab=analytics' },
  { l: 'Deals recorded', v: myPays.value.length, s: `${myPays.value.filter(p => p.type === 'Sale').length} sale · ${myPays.value.filter(p => p.type === 'Rent').length} rent`, i: 'list', n: true, to: '/agent?tab=deals' }
])
const recentDeals = computed(() => [...myPays.value].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 4))
const myCred = computed(() => (auth.user ? creds.of(auth.user.id) : undefined))
const attention = computed(() => [
  { label: 'New client requests', count: requests.value.filter(r => r.status === 'New').length, to: '/agent?tab=requests', icon: 'list', urgent: true },
  { label: 'Unread messages', count: unreadMsgs.value, to: '/agent?tab=messages', icon: 'chat', urgent: true },
  { label: 'Viewings to confirm', count: appointments.value.filter(a => a.status === 'Pending').length, to: '/agent?tab=appointments', icon: 'calendar' },
  { label: 'Offers to answer', count: offers.value.filter(o => o.status === 'Pending').length, to: '/agent?tab=offers', icon: 'cash' },
  { label: 'Deals pending approval', count: pendingDeals.value, to: '/agent?tab=deals', icon: 'clock' },
  { label: verified.value ? 'License verified' : 'License not verified yet', count: verified.value ? 0 : 1, to: '/agent?tab=verification', icon: 'shield', urgent: true }
])

const lockMsg = 'Get PRC verified first. Open the Verification tab to submit your license.'

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
const firstName = computed(() => auth.user?.name.split(' ')[0] ?? 'Agent')

// --- Reactive State for Agent Features ---

// 1. Assigned Requests
interface AssignedRequest {
  id: string
  client: string
  phone: string
  email: string
  property: string
  propertyId: string
  price: string
  status: 'New' | 'Contacted' | 'Tour Scheduled' | 'Resolved'
  notes: string
  date: string
}

const requests = ref<AssignedRequest[]>([
  {
    id: 'REQ-1001',
    client: 'Maria Santos',
    phone: '+63 917 555 0192',
    email: 'maria.santos@gmail.com',
    property: 'Uptown Butuan 2BR Condominium',
    propertyId: 'uptown-butuan-2br-condominium',
    price: '₱4,500,000',
    status: 'New',
    notes: 'Inquiring if unit is move-in ready and if bank financing with BDO or BPI is accepted.',
    date: 'Today, 9:30 AM'
  },
  {
    id: 'REQ-1045',
    client: 'Carlos Mendoza',
    phone: '+63 928 441 8890',
    email: 'carlos.m@yahoo.com',
    property: 'Downtown Butuan Executive Loft',
    propertyId: 'downtown-butuan-executive-loft',
    price: '₱35,000 / mo',
    status: 'Contacted',
    notes: 'Looking for 1-year commercial lease for engineering consulting firm. Needs 2 parking slots.',
    date: 'Yesterday, 3:15 PM'
  },
  {
    id: 'REQ-1063',
    client: 'Dr. Leah Gonzales',
    phone: '+63 905 123 9988',
    email: 'leah.g@outlook.com',
    property: 'Modern Tropical House with Pool',
    propertyId: 'modern-tropical-house-with-pool',
    price: '₱12,800,000',
    status: 'Tour Scheduled',
    notes: 'Client relocating from Davao to Butuan City Hospital. Requested Saturday morning viewing.',
    date: 'Oct 16, 2026'
  }
])

const reqFilter = ref<'All' | 'New' | 'Contacted' | 'Tour Scheduled' | 'Resolved'>('All')
const filteredRequests = computed(() => {
  if (reqFilter.value === 'All') return requests.value
  return requests.value.filter(r => r.status === reqFilter.value)
})

function updateRequestStatus(req: AssignedRequest, newStatus: AssignedRequest['status']) {
  req.status = newStatus
  ui.toast(`${req.id} status updated to "${newStatus}"`, 'success')
}

// 2. Appointments
interface AppointmentItem {
  id: string
  day: number
  month: string
  time: string
  client: string
  phone: string
  property: string
  location: string
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
  type: string
}

const appointments = ref<AppointmentItem[]>([
  {
    id: 'APT-1',
    day: 19,
    month: 'OCT',
    time: '10:00 AM',
    client: 'Maria Santos',
    phone: '+63 917 555 0192',
    property: 'Uptown Butuan 2BR Condominium',
    location: 'Libertad, Butuan City',
    status: 'Confirmed',
    type: 'In-person Viewing'
  },
  {
    id: 'APT-2',
    day: 21,
    month: 'OCT',
    time: '02:30 PM',
    client: 'Carlos Mendoza',
    phone: '+63 928 441 8890',
    property: 'Downtown Butuan Executive Loft',
    location: 'J.C. Aquino Ave, Butuan City',
    status: 'Pending',
    type: 'Commercial Walkthrough'
  },
  {
    id: 'APT-3',
    day: 24,
    month: 'OCT',
    time: '09:00 AM',
    client: 'Dr. Leah Gonzales',
    phone: '+63 905 123 9988',
    property: 'Modern Tropical House with Pool',
    location: 'Villa Kananga, Butuan City',
    status: 'Confirmed',
    type: 'VIP Client Tour'
  }
])

const showNewApptModal = ref(false)
const newAppt = reactive({
  client: '',
  phone: '',
  property: 'Uptown Butuan 2BR Condominium',
  date: '2026-10-25',
  time: '11:00 AM',
  type: 'In-person Viewing'
})

function addAppointment() {
  if (!newAppt.client.trim()) {
    ui.toast('Please enter client name.', 'error')
    return
  }
  const dateObj = new Date(newAppt.date || Date.now())
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  appointments.value.unshift({
    id: `APT-${Date.now().toString().slice(-4)}`,
    day: dateObj.getDate() || 25,
    month: months[dateObj.getMonth()] || 'OCT',
    time: newAppt.time || '10:00 AM',
    client: newAppt.client,
    phone: newAppt.phone || '+63 917 000 0000',
    property: newAppt.property,
    location: 'Butuan City',
    status: 'Confirmed',
    type: newAppt.type
  })
  ui.toast(`Appointment scheduled for ${newAppt.client}!`, 'success')
  showNewApptModal.value = false
  newAppt.client = ''
  newAppt.phone = ''
}

function updateApptStatus(item: AppointmentItem, newStatus: AppointmentItem['status']) {
  item.status = newStatus
  ui.toast(`Appointment marked as ${newStatus}.`, 'info')
}

// 4. Listings Management
interface AgentListing {
  id: string
  title: string
  location: string
  price: string
  type: string
  beds: number
  baths: number
  sqm: number
  status: 'Active' | 'Under Offer' | 'Draft'
  views: number
  inquiries: number
  badge: string
}

const myListings = ref<AgentListing[]>([
  {
    id: 'uptown-butuan-2br-condominium',
    title: 'Uptown Butuan 2BR Condominium',
    location: 'Libertad, Butuan City',
    price: '₱4,500,000',
    type: 'Condominium',
    beds: 2,
    baths: 2,
    sqm: 68,
    status: 'Active',
    views: 284,
    inquiries: 7,
    badge: 'Exclusive'
  },
  {
    id: 'downtown-butuan-executive-loft',
    title: 'Downtown Butuan Executive Loft',
    location: 'J.C. Aquino Ave, Butuan City',
    price: '₱35,000 / mo',
    type: 'Loft / Commercial',
    beds: 1,
    baths: 1,
    sqm: 54,
    status: 'Active',
    views: 196,
    inquiries: 5,
    badge: 'Commercial'
  },
  {
    id: 'modern-tropical-house-with-pool',
    title: 'Modern Tropical House with Pool',
    location: 'Villa Kananga, Butuan City',
    price: '₱12,800,000',
    type: 'Single Family House',
    beds: 4,
    baths: 3,
    sqm: 220,
    status: 'Under Offer',
    views: 520,
    inquiries: 19,
    badge: 'Luxury'
  },
  {
    id: 'jc-aquino-commercial-building',
    title: 'J.C. Aquino Retail / Office Space',
    location: 'Downtown, Butuan City',
    price: '₱85,000 / mo',
    type: 'Commercial',
    beds: 0,
    baths: 2,
    sqm: 140,
    status: 'Draft',
    views: 45,
    inquiries: 2,
    badge: 'Commercial'
  }
])

const showAddListingModal = ref(false)
const newListing = reactive({
  title: '',
  location: 'Libertad, Butuan City',
  price: '₱5,000,000',
  type: 'Residential House',
  beds: 3,
  baths: 2,
  sqm: 120
})

function addListingDraft() {
  if (!verified.value) { ui.toast(lockMsg, 'error'); return }
  if (!newListing.title.trim()) {
    ui.toast('Please provide a listing title.', 'error')
    return
  }
  myListings.value.unshift({
    id: `draft-${Date.now()}`,
    title: newListing.title,
    location: newListing.location,
    price: newListing.price,
    type: newListing.type,
    beds: Number(newListing.beds) || 1,
    baths: Number(newListing.baths) || 1,
    sqm: Number(newListing.sqm) || 50,
    status: 'Draft',
    views: 0,
    inquiries: 0,
    badge: 'Draft'
  })
  ui.toast(`Listing draft "${newListing.title}" created!`, 'success')
  showAddListingModal.value = false
  newListing.title = ''
}

function toggleListingStatus(item: AgentListing) {
  if (!verified.value && item.status === 'Draft') { ui.toast(lockMsg, 'error'); return } // publishing needs a verified license
  if (item.status === 'Active') item.status = 'Draft'
  else if (item.status === 'Draft') item.status = 'Active'
  else item.status = 'Active'
  ui.toast(`Listing status updated to ${item.status}.`, 'info')
}

// 5. Offers
interface PropertyOffer {
  id: string
  property: string
  askingPrice: string
  offeredAmount: string
  buyer: string
  buyerPhone: string
  terms: string
  deposit: string
  status: 'Pending' | 'Countered' | 'Accepted' | 'Declined'
  date: string
}

const offers = ref<PropertyOffer[]>([
  {
    id: 'OFFER-8801',
    property: 'Uptown Butuan 2BR Condominium',
    askingPrice: '₱4,500,000',
    offeredAmount: '₱4,250,000',
    buyer: 'Engr. Roberto Gomez',
    buyerPhone: '+63 917 882 1010',
    terms: 'Spot cash payment within 30 days',
    deposit: '₱200,000 earnest money submitted',
    status: 'Pending',
    date: 'Oct 18, 2026'
  },
  {
    id: 'OFFER-8794',
    property: 'Downtown Butuan Executive Loft',
    askingPrice: '₱35,000 / mo',
    offeredAmount: '₱32,000 / mo',
    buyer: 'Carlos Mendoza (Nexus Engineering)',
    buyerPhone: '+63 928 441 8890',
    terms: '2-Year Corporate Lease agreement',
    deposit: '2 months advance, 2 months security deposit',
    status: 'Countered',
    date: 'Oct 17, 2026'
  },
  {
    id: 'OFFER-8750',
    property: 'Modern Tropical House with Pool',
    askingPrice: '₱12,800,000',
    offeredAmount: '₱12,500,000',
    buyer: 'Dr. Leah Gonzales',
    buyerPhone: '+63 905 123 9988',
    terms: 'Bank financing approved via BDO Caraga Branch',
    deposit: '₱500,000 earnest money with proof of funds',
    status: 'Accepted',
    date: 'Oct 15, 2026'
  }
])

function setOfferStatus(o: PropertyOffer, s: PropertyOffer['status']) {
  o.status = s
  if (s === 'Accepted') ui.toast(`Offer ${o.id} accepted! Contract stage initiated.`, 'success')
  else if (s === 'Declined') ui.toast(`Offer ${o.id} declined.`, 'info')
  else ui.toast(`Offer ${o.id} marked as ${s}.`, 'info')
}

// 6. Agent Profile
const profileData = reactive({
  name: computed(() => auth.user?.name || 'Authorized Agent'),
  email: computed(() => auth.user?.email || 'agent@bahayhub.test'),
  phone: '+63 917 889 4410',
  prcLicense: 'PRC REB #0029481',
  dhsudReg: 'DHSUD-CAR-B-04/22-019',
  brokerage: 'BahayHub Butuan Realty & Partners',
  office: 'Km 3, J.C. Aquino Avenue, Butuan City',
  experience: '8 Years Active in Butuan Real Estate',
  specialization: 'Residential Sales, Condominium Turnovers & Commercial Leasing',
  areas: 'Libertad, Villa Kananga, Doongan, Ampayon, Bancasi'
})

function saveProfile() {
  ui.toast('Agent profile credentials saved successfully.', 'success')
}

function signOut() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div v-if="auth.user && auth.user.role === 'agent'" class="ws-page">

    <!-- Hero Banner -->
    <div class="ws-hero">
      <div class="wrap ws-hero-in">
        <div class="ws-hero-left">
          <p class="ws-eyebrow">Agent Workspace <span class="ws-dot">·</span> Butuan City</p>
          <Transition name="swap" mode="out-in">
            <div :key="heroTitle">
              <h1 class="ws-title">{{ heroTitle }}</h1>
              <p class="ws-sub">{{ heroSub }}</p>
            </div>
          </Transition>
          <div class="ws-notice">
            <span class="ws-notice-dot" />
            <span><b>Real-time local state:</b> All actions, appointments, and client records update reactively in your workspace.</span>
          </div>
        </div>
        <div class="ws-hero-card">
          <p class="ws-signed-label">Authorized Real Estate Agent</p>
          <p class="ws-signed-email">{{ auth.user.email }}</p>
          <p class="ws-signed-note">{{ profileData.prcLicense }}</p>
          <VerifiedBadge v-if="verified" style="margin-top:8px" />
          <button class="btn btn-ghost btn-sm ws-signout" @click="signOut">Sign out</button>
        </div>
      </div>
    </div>

    <!-- Tab Nav -->
    <div class="ws-tabs-bar">
      <div class="wrap">
        <nav class="ws-tabs" role="tablist">
          <button
            v-for="tab in tabs" :key="tab.id"
            role="tab" :aria-selected="activeTab === tab.id"
            :class="['ws-tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
            <span v-if="tab.badge" class="ws-tab-badge">{{ tab.badge }}</span>
          </button>
        </nav>
        <WorkspaceTabSelect v-model="activeTab" :tabs="tabs" />
      </div>
    </div>

    <!-- Main Workspace Content -->
    <div class="wrap ws-body">
      <SituationNotice />
      <ContextDrawer :open="!!statFor" :title="statFor?.l.title ?? ''" :eyebrow="statFor?.kind === 'views' ? 'Listing views' : 'Listing inquiries'" @close="statFor = null">
        <template v-if="statFor">
          <p class="x-bignum">{{ statFor.kind === 'views' ? statFor.l.views : statFor.l.inquiries }}</p>
          <p class="x-muted">{{ statFor.kind === 'views' ? 'People who opened this listing page on BahayHub. A repeat visit from the same browser counts once per day.' : 'Messages and viewing requests sent from this listing.' }}</p>
          <dl class="x-dl" style="margin-top:14px">
            <div><dt>Status</dt><dd>{{ statFor.l.status }}</dd></div>
            <div><dt>Views</dt><dd>{{ statFor.l.views }}</dd></div>
            <div><dt>Inquiries</dt><dd>{{ statFor.l.inquiries }}</dd></div>
            <div><dt>Inquiry rate</dt><dd>{{ statFor.l.views ? Math.round(statFor.l.inquiries / statFor.l.views * 100) : 0 }}% of views</dd></div>
          </dl>
          <div style="display:flex;gap:8px;margin-top:16px">
            <NuxtLink :to="`/property/${statFor.l.id}`" class="btn btn-navy btn-sm" target="_blank">View on site ↗</NuxtLink>
            <button v-if="statFor.kind === 'inquiries'" class="btn btn-ghost btn-sm" @click="statFor = null; activeTab = 'requests'">Open requests</button>
          </div>
        </template>
      </ContextDrawer>
      <Transition name="swap" mode="out-in">

      <!-- ================= TAB: OVERVIEW ================= -->

      <section v-if="activeTab === 'overview'" class="ws-panel-fade">
        <div class="ws-snapshot-header">
          <div>
            <p class="ws-section-eyebrow">Workspace Snapshot</p>
            <h2 class="ws-section-title">Today's Activity</h2>
            <p class="ws-section-sub">Overview of your assigned leads, upcoming property viewings, and pending purchase offers.</p>
          </div>
          <button class="btn btn-navy btn-sm" @click="activeTab = 'profile'">Manage Agent Profile →</button>
        </div>

        <AttentionStrip :items="attention" />

        <p class="x-ov-label">Earnings</p>
        <div class="ws-stats">
          <NuxtLink v-for="(k, i) in overviewKpis" :key="k.l" v-reveal="i" :to="k.to" class="ws-stat clickable">
            <div class="ws-stat-top"><span class="ws-stat-label">{{ k.l }}</span><span class="ws-stat-icon"><Icon :name="k.i" /></span></div>
            <div class="ws-stat-val" :class="{ 'x-orange': k.o }"><CountUp :value="k.v" :fmt="k.n ? String : undefined" /></div>
            <div class="ws-stat-sub">{{ k.s }}</div>
          </NuxtLink>
        </div>

        <div class="x-ov-3">
          <MiniTrend :payments="myPays" to="/agent?tab=analytics" />
          <div class="ws-card">
            <div class="ws-card-header" style="margin-bottom:6px">
              <div><p class="ws-card-eyebrow">My deals</p><h3 class="ws-card-title">Latest deals</h3></div>
              <NuxtLink to="/agent?tab=deals" class="ws-link-btn">All →</NuxtLink>
            </div>
            <NuxtLink v-for="p in recentDeals" :key="p.id" :to="`/agent?tab=deals&focus=${p.id}`" class="x-mini-row">
              <span><b>{{ p.id }}</b> <span class="x-tag" :class="p.type.toLowerCase()">{{ p.type }}</span><small>{{ p.clientName }} · {{ p.propertyTitle }}</small></span>
              <span class="x-mini-side"><b>{{ pesoShort(p.amount) }}</b><span class="x-pill" :class="p.status.toLowerCase()">{{ p.status }}</span></span>
            </NuxtLink>
            <p v-if="!recentDeals.length" class="x-empty" style="padding:14px 0">No deals yet. Record one from My deals.</p>
            <div v-if="myCred" class="ws-coverage-stats" style="margin-top:8px">
              <div class="ws-coverage-row"><span>PRC license</span><b>{{ myCred.status }}</b></div>
              <div class="ws-coverage-row"><span>Expires</span><b>{{ fmtMonth(myCred.expiryDate) }}</b></div>
            </div>
          </div>
          <RecentFeed />
        </div>

        <p class="x-ov-label">Day-to-day</p>
        <div class="ws-stats">
          <div class="ws-stat clickable" @click="activeTab = 'requests'">
            <div class="ws-stat-top">
              <span class="ws-stat-label">Assigned requests</span>
              <span class="ws-stat-icon"><Icon name="list" /></span>
            </div>
            <div class="ws-stat-val">{{ requests.filter(r => r.status !== 'Resolved').length }}</div>
            <div class="ws-stat-sub">{{ requests.filter(r => r.status === 'New').length }} new awaiting your response</div>
          </div>

          <div class="ws-stat clickable" @click="activeTab = 'appointments'">
            <div class="ws-stat-top">
              <span class="ws-stat-label">Upcoming viewings</span>
              <span class="ws-stat-icon"><Icon name="calendar" /></span>
            </div>
            <div class="ws-stat-val">{{ appointments.filter(a => a.status !== 'Cancelled').length }}</div>
            <div class="ws-stat-sub">Next scheduled for Oct 19, 10:00 AM</div>
          </div>

          <div class="ws-stat clickable" @click="activeTab = 'messages'">
            <div class="ws-stat-top">
              <span class="ws-stat-label">Active conversations</span>
              <span class="ws-stat-icon"><Icon name="chat" /></span>
            </div>
            <div class="ws-stat-val">{{ msgStore.mine(auth.user).length }}</div>
            <div class="ws-stat-sub">{{ unreadMsgs }} unread</div>
          </div>

          <div class="ws-stat clickable" @click="activeTab = 'listings'">
            <div class="ws-stat-top">
              <span class="ws-stat-label">My active listings</span>
              <span class="ws-stat-icon"><Icon name="home" /></span>
            </div>
            <div class="ws-stat-val">{{ myListings.filter(l => l.status === 'Active').length }}</div>
            <div class="ws-stat-sub">{{ myListings.reduce((sum, l) => sum + l.views, 0) }} total views this month</div>
          </div>
        </div>

        <div class="ws-grid2">
          <!-- Upcoming appointments preview -->
          <div class="ws-card">
            <div class="ws-card-header">
              <div>
                <p class="ws-card-eyebrow">Next Up</p>
                <h3 class="ws-card-title">Scheduled Property Viewings</h3>
              </div>
              <button class="ws-link-btn" @click="activeTab = 'appointments'">Full calendar view →</button>
            </div>
            <div v-for="a in appointments.slice(0, 3)" :key="a.id" class="ws-appt">
              <div class="ws-appt-date">
                <span class="ws-appt-day">{{ a.day }}</span>
                <span class="ws-appt-month">{{ a.month }}</span>
              </div>
              <div class="ws-appt-info">
                <b>{{ a.client }}</b>
                <p>{{ a.property }} · {{ a.time }}</p>
                <small style="color:var(--muted)">{{ a.type }} · {{ a.location }}</small>
              </div>
              <span :class="['ws-badge', a.status === 'Confirmed' ? 'ws-badge-green' : 'ws-badge-orange']">{{ a.status }}</span>
            </div>
          </div>

          <!-- Quick Actions & Pipeline -->
          <div class="ws-card">
            <p class="ws-card-eyebrow">Quick Actions</p>
            <h3 class="ws-card-title">Direct Agent Tools</h3>
            <p class="ws-card-sub">Jump right into managing leads, updating draft properties, or responding to client offers.</p>
            <div class="ws-actions">
              <button class="ws-action-btn" @click="activeTab = 'requests'">
                <Icon name="list" /> Review Client Inquiries ({{ requests.length }})
              </button>
              <button class="ws-action-btn" :disabled="!verified" :title="verified ? '' : lockMsg" @click="showAddListingModal = true; activeTab = 'listings'">
                <Icon name="plus" /> Post New Listing Draft
              </button>
              <button class="ws-action-btn" @click="activeTab = 'messages'">
                <Icon name="chat" /> Reply to Maria Santos
              </button>
              <button class="ws-action-btn" @click="activeTab = 'offers'">
                <Icon name="cash" /> Review Purchase Offers ({{ offers.length }})
              </button>
            </div>
            <div style="margin-top:16px;padding:12px;background:var(--bg);border-radius:12px;font-size:12.5px">
              <b>Butuan Market Tip:</b> Properties in Libertad and Villa Kananga are currently receiving the highest inquiry volume this quarter.
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TAB: ASSIGNED REQUESTS ================= -->
      <section v-else-if="activeTab === 'requests'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Lead Management</p>
            <h2 class="ws-section-title">Assigned Client Requests ({{ filteredRequests.length }})</h2>
            <p class="ws-section-sub">Direct client inquiries for your listings forwarded by the BahayHub admin authority.</p>
          </div>
          <div class="ws-filter-pills">
            <button
              v-for="f in ['All', 'New', 'Contacted', 'Tour Scheduled', 'Resolved']" :key="f"
              :class="['pill', { 'active-pill': reqFilter === f }]"
              :aria-pressed="reqFilter === f"
              @click="reqFilter = f as any"
            >
              {{ f }}
            </button>
          </div>
        </div>

        <div class="ws-cards-stack">
          <div v-for="r in filteredRequests" :key="r.id" class="ws-card ws-req-detail-card">
            <div class="ws-req-top">
              <div>
                <span class="ws-badge ws-badge-navy">{{ r.id }}</span>
                <span :class="['ws-badge', r.status === 'New' ? 'ws-badge-orange' : r.status === 'Contacted' ? 'ws-badge-blue' : r.status === 'Tour Scheduled' ? 'ws-badge-green' : 'ws-badge-outline']" style="margin-left:6px">
                  {{ r.status }}
                </span>
                <h3 style="margin-top:8px;font-size:17px;font-family:var(--font-head);color:var(--ink)">{{ r.client }}</h3>
                <p style="font-size:13px;color:var(--muted)">Interested in: <b style="color:var(--navy)">{{ r.property }}</b> ({{ r.price }})</p>
              </div>
              <div class="ws-req-contact-info">
                <span><Icon name="phone" /> {{ r.phone }}</span>
                <span><Icon name="mail" /> {{ r.email }}</span>
                <small style="color:var(--muted)">Received: {{ r.date }}</small>
              </div>
            </div>

            <div class="ws-req-notes">
              <b>Client Note:</b> "{{ r.notes }}"
            </div>

            <div class="ws-req-actions-bar">
              <div class="ws-req-status-select">
                <span>Change Status:</span>
                <button v-if="r.status !== 'Contacted'" class="btn btn-ghost btn-sm" @click="updateRequestStatus(r, 'Contacted')">Mark Contacted</button>
                <button v-if="r.status !== 'Tour Scheduled'" class="btn btn-ghost btn-sm" @click="updateRequestStatus(r, 'Tour Scheduled')">Schedule Tour</button>
                <button v-if="r.status !== 'Resolved'" class="btn btn-ghost btn-sm" @click="updateRequestStatus(r, 'Resolved')">Mark Resolved</button>
              </div>
              <div class="ws-req-btn-group">
                <button class="btn btn-navy btn-sm" @click="activeTab = 'messages'">Open Chat</button>
                <NuxtLink :to="`/property/${r.propertyId}`" class="btn btn-soft btn-sm" target="_blank">View Property ↗</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TAB: APPOINTMENTS ================= -->
      <section v-else-if="activeTab === 'appointments'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Schedule</p>
            <h2 class="ws-section-title">Property Viewings &amp; Meetings</h2>
            <p class="ws-section-sub">Confirmed and requested buyer walkthroughs across your active Butuan listings.</p>
          </div>
          <button class="btn btn-orange btn-sm" @click="showNewApptModal = true">+ Schedule New Viewing</button>
        </div>

        <!-- Add Appointment Inline / Modal -->
        <div v-if="showNewApptModal" class="ws-card ws-form-card" style="margin-bottom:20px">
          <div class="ws-card-header">
            <h3>Schedule a Viewing</h3>
            <button class="btn btn-ghost btn-sm" @click="showNewApptModal = false">Cancel</button>
          </div>
          <form class="ws-form-grid" @submit.prevent="addAppointment">
            <div class="form-row">
              <label>Client Name</label>
              <input v-model="newAppt.client" class="input" placeholder="e.g. Atty. Juan Dela Cruz" required />
            </div>
            <div class="form-row">
              <label>Contact Phone</label>
              <input v-model="newAppt.phone" class="input" placeholder="+63 917 000 0000" />
            </div>
            <div class="form-row">
              <label>Property</label>
              <select v-model="newAppt.property" class="input">
                <option v-for="l in myListings" :key="l.id" :value="l.title">{{ l.title }} ({{ l.price }})</option>
              </select>
            </div>
            <div class="form-row">
              <label>Date &amp; Time</label>
              <div style="display:flex;gap:10px">
                <input v-model="newAppt.date" type="date" class="input" />
                <input v-model="newAppt.time" class="input" placeholder="e.g. 10:00 AM" />
              </div>
            </div>
            <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:10px">
              <button type="button" class="btn btn-ghost btn-sm" @click="showNewApptModal = false">Cancel</button>
              <button type="submit" class="btn btn-navy btn-sm">Confirm Appointment</button>
            </div>
          </form>
        </div>

        <div class="ws-cards-stack">
          <div v-for="a in appointments" :key="a.id" class="ws-card ws-appt-card">
            <div class="ws-appt-card-left">
              <div class="ws-appt-calendar-badge">
                <span class="day">{{ a.day }}</span>
                <span class="month">{{ a.month }}</span>
              </div>
              <div class="ws-appt-meta">
                <div style="display:flex;align-items:center;gap:8px">
                  <h3 style="font-size:16px;color:var(--ink);font-weight:700">{{ a.client }}</h3>
                  <span :class="['ws-badge', a.status === 'Confirmed' ? 'ws-badge-green' : a.status === 'Pending' ? 'ws-badge-orange' : 'ws-badge-outline']">{{ a.status }}</span>
                </div>
                <p style="font-size:14px;color:var(--navy);font-weight:600;margin-top:2px">{{ a.property }}</p>
                <p style="font-size:12.5px;color:var(--muted)">{{ a.location }} · {{ a.time }} · {{ a.type }}</p>
                <p style="font-size:12.5px;color:var(--muted)"><Icon name="phone" /> {{ a.phone }}</p>
              </div>
            </div>
            <div class="ws-appt-card-right">
              <button v-if="a.status !== 'Confirmed'" class="btn btn-navy btn-sm" @click="updateApptStatus(a, 'Confirmed')">Confirm</button>
              <button v-if="a.status !== 'Completed'" class="btn btn-ghost btn-sm" @click="updateApptStatus(a, 'Completed')">Mark Done</button>
              <button v-if="a.status !== 'Cancelled'" class="btn btn-soft btn-sm" @click="updateApptStatus(a, 'Cancelled')">Cancel</button>
            </div>
          </div>
        </div>
      </section>

      <PaymentsPanel v-else-if="activeTab === 'deals'" mode="agent" />
      <PaymentsPanel v-else-if="activeTab === 'commission'" mode="agent" summary />
      <SalesAnalytics v-else-if="activeTab === 'analytics'" scope="agent" />
      <VerificationAgent v-else-if="activeTab === 'verification'" />

      <!-- ================= TAB: MESSAGES ================= -->
      <MessagesPanel v-else-if="activeTab === 'messages'" />

      <!-- ================= TAB: LISTINGS ================= -->
      <section v-else-if="activeTab === 'listings'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Portfolio</p>
            <h2 class="ws-section-title">My Managed Properties ({{ myListings.length }})</h2>
            <p class="ws-section-sub">Published and draft listings under your licensed agent profile in Butuan City.</p>
          </div>
          <button class="btn btn-orange btn-sm" :disabled="!verified" :aria-describedby="verified ? undefined : 'lock-note'" @click="showAddListingModal = true">+ Post New Listing Draft</button>
        </div>

        <p v-if="!verified" id="lock-note" class="x-lock" role="note">{{ lockMsg }} <button class="ws-link-btn" @click="activeTab = 'verification'">Go to Verification →</button></p>
        <!-- Add Listing Modal / Box -->
        <div v-if="showAddListingModal" class="ws-card ws-form-card" style="margin-bottom:20px">
          <div class="ws-card-header">
            <h3>Add Property Listing Draft</h3>
            <button class="btn btn-ghost btn-sm" @click="showAddListingModal = false">Cancel</button>
          </div>
          <form class="ws-form-grid" @submit.prevent="addListingDraft">
            <div class="form-row">
              <label>Property Title</label>
              <input v-model="newListing.title" class="input" placeholder="e.g. Modern Bungalow in Ampayon" required />
            </div>
            <div class="form-row">
              <label>Location / Barangay</label>
              <input v-model="newListing.location" class="input" placeholder="e.g. Ampayon, Butuan City" required />
            </div>
            <div class="form-row">
              <label>Price (PHP)</label>
              <input v-model="newListing.price" class="input" placeholder="e.g. ₱5,800,000 or ₱25,000 / mo" required />
            </div>
            <div class="form-row">
              <label>Property Type</label>
              <select v-model="newListing.type" class="input">
                <option value="Residential House">Residential House</option>
                <option value="Condominium">Condominium</option>
                <option value="Commercial Space">Commercial Space</option>
                <option value="Lot / Land">Lot / Land</option>
              </select>
            </div>
            <div class="form-row">
              <label>Bedrooms / Baths / Floor Area</label>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
                <input v-model="newListing.beds" type="number" class="input" placeholder="Beds" />
                <input v-model="newListing.baths" type="number" class="input" placeholder="Baths" />
                <input v-model="newListing.sqm" type="number" class="input" placeholder="Floor area (sqm)" />
              </div>
            </div>
            <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:10px">
              <button type="button" class="btn btn-ghost btn-sm" @click="showAddListingModal = false">Cancel</button>
              <button type="submit" class="btn btn-navy btn-sm">Save Listing Draft</button>
            </div>
          </form>
        </div>

        <div class="ws-grid2">
          <div v-for="l in myListings" :key="l.id" class="ws-card ws-listing-item-card">
            <div class="ws-listing-top">
              <div>
                <span class="media-label" style="position:static;display:inline-block;margin-bottom:6px">{{ l.badge }}</span>
                <span :class="['ws-badge', l.status === 'Active' ? 'ws-badge-green' : l.status === 'Under Offer' ? 'ws-badge-orange' : 'ws-badge-outline']" style="margin-left:6px">
                  {{ l.status }}
                </span>
                <h3 style="font-size:16px;color:var(--ink);font-weight:700;margin-top:4px">{{ l.title }}</h3>
                <p style="font-size:12.5px;color:var(--muted)"><Icon name="pin" /> {{ l.location }} · {{ l.type }}</p>
              </div>
              <div class="ws-listing-price-tag">
                {{ l.price }}
              </div>
            </div>

            <div class="ws-listing-specs">
              <span><Icon name="bed" /> {{ l.beds }} Beds</span>
              <span><Icon name="bath" /> {{ l.baths }} Baths</span>
              <span><Icon name="area" /> {{ l.sqm }} sqm</span>
              <button class="x-chipbtn" @click="statFor = { l, kind: 'views' }"><Icon name="eye" /> {{ l.views }} Views</button>
              <button class="x-chipbtn" @click="statFor = { l, kind: 'inquiries' }"><Icon name="chat" /> {{ l.inquiries }} Inquiries</button>
            </div>

            <div class="ws-listing-actions">
              <button class="btn btn-ghost btn-sm" @click="toggleListingStatus(l)">
                {{ l.status === 'Active' ? 'Set to Draft' : 'Publish Active' }}
              </button>
              <NuxtLink :to="`/property/${l.id}`" class="btn btn-navy btn-sm" target="_blank">
                View on Site ↗
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>


      <!-- ================= TAB: OFFERS ================= -->
      <section v-else-if="activeTab === 'offers'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Negotiation Pipeline</p>
            <h2 class="ws-section-title">Purchase &amp; Lease Offers ({{ offers.length }})</h2>
            <p class="ws-section-sub">Formal buyer submissions and contracts under negotiation for your Butuan properties.</p>
          </div>
        </div>

        <div class="ws-cards-stack">
          <div v-for="o in offers" :key="o.id" class="ws-card ws-offer-card">
            <div class="ws-offer-top">
              <div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span class="ws-badge ws-badge-navy">{{ o.id }}</span>
                  <span :class="['ws-badge', o.status === 'Accepted' ? 'ws-badge-green' : o.status === 'Countered' ? 'ws-badge-blue' : o.status === 'Declined' ? 'ws-badge-outline' : 'ws-badge-orange']">
                    {{ o.status }}
                  </span>
                  <small style="color:var(--muted)">Submitted {{ o.date }}</small>
                </div>
                <h3 style="font-size:17px;color:var(--ink);font-weight:700;margin-top:6px">{{ o.property }}</h3>
                <p style="font-size:13px;color:var(--muted)">Buyer: <b style="color:var(--navy)">{{ o.buyer }}</b> · {{ o.buyerPhone }}</p>
              </div>

              <div class="ws-offer-pricing">
                <small style="color:var(--muted);text-transform:uppercase;font-size:11px;font-weight:700">Offered Amount</small>
                <div class="ws-offer-amt">{{ o.offeredAmount }}</div>
                <span style="font-size:11.5px;color:var(--muted)">Asking: {{ o.askingPrice }}</span>
              </div>
            </div>

            <div class="ws-offer-details-box">
              <div class="ws-offer-term"><span>Terms:</span> <b>{{ o.terms }}</b></div>
              <div class="ws-offer-term"><span>Earnest / Deposit:</span> <b>{{ o.deposit }}</b></div>
            </div>

            <div class="ws-offer-actions">
              <button
                v-if="o.status !== 'Accepted'"
                class="btn btn-navy btn-sm"
                @click="setOfferStatus(o, 'Accepted')"
              >
                Accept offer
              </button>
              <button
                v-if="o.status !== 'Countered' && o.status !== 'Accepted'"
                class="btn btn-ghost btn-sm"
                @click="setOfferStatus(o, 'Countered')"
              >
                Counter offer
              </button>
              <button
                v-if="o.status !== 'Declined' && o.status !== 'Accepted'"
                class="btn btn-soft btn-sm"
                @click="setOfferStatus(o, 'Declined')"
              >
                Decline
              </button>
              <button class="btn btn-ghost btn-sm" style="margin-left:auto" @click="activeTab = 'messages'">
                Message buyer
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TAB: PROFILE ================= -->
      <section v-else-if="activeTab === 'profile'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Professional Credentials</p>
            <h2 class="ws-section-title">Agent Profile &amp; Verification</h2>
            <p class="ws-section-sub">Public verification details displayed on property listings and client inquiry confirmations.</p>
          </div>
        </div>
        <ProfileEditor style="margin-bottom:16px" />

        <div class="ws-grid2 ws-grid2-wide">
          <div class="ws-card">
            <h3 class="ws-card-title" style="margin-bottom:16px">License &amp; Contact Details</h3>
            <form class="ws-form-grid" @submit.prevent="saveProfile">
              <div class="form-row">
                <label>Full Agent Name</label>
                <input v-model="profileData.name" class="input" />
              </div>
              <div class="form-row">
                <label>Email Address</label>
                <input v-model="profileData.email" class="input" readonly style="background:var(--bg)" />
              </div>
              <div class="form-row">
                <label>Direct Phone Number</label>
                <input v-model="profileData.phone" class="input" />
              </div>
              <div class="form-row">
                <label>PRC Real Estate License Number</label>
                <input v-model="profileData.prcLicense" class="input" />
              </div>
              <div class="form-row">
                <label>DHSUD / HLURB Registration</label>
                <input v-model="profileData.dhsudReg" class="input" />
              </div>
              <div class="form-row">
                <label>Brokerage Agency</label>
                <input v-model="profileData.brokerage" class="input" />
              </div>
              <div class="form-row" style="grid-column:1/-1">
                <label>Office Address</label>
                <input v-model="profileData.office" class="input" />
              </div>
              <div class="form-row" style="grid-column:1/-1">
                <label>Coverage Barangays in Butuan</label>
                <input v-model="profileData.areas" class="input" />
              </div>
              <div style="grid-column:1/-1;margin-top:10px">
                <button type="submit" class="btn btn-navy btn-sm" style="height:42px;padding:0 24px">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div class="ws-card">
            <h3 class="ws-card-title">Verification Status</h3>
            <div style="margin:16px 0;padding:16px;background:var(--ok-bg);border-radius:14px;color:var(--ok);display:flex;align-items:flex-start;gap:12px">
              <Icon name="shield" style="font-size:22px;color:var(--orange)" />
              <div>
                <b>PRC Verified Agent</b>
                <p style="font-size:12.5px;margin-top:2px;color:var(--ok)">Your license is verified on the Butuan City real estate roster.</p>
              </div>
            </div>

            <div class="ws-coverage-stats">
              <div class="ws-coverage-row"><span>Active Inquiries</span><b>{{ requests.length }}</b></div>
              <div class="ws-coverage-row"><span>Active Listings</span><b>{{ myListings.length }}</b></div>
              <div class="ws-coverage-row"><span>Total Closed Offers</span><b>8</b></div>
              <div class="ws-coverage-row"><span>Client Satisfaction</span><b>4.9 / 5.0</b></div>
            </div>
          </div>
        </div>
      </section>

      </Transition>
    </div>
  </div>
</template>
