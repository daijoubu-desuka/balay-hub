<script setup lang="ts">
definePageMeta({ middleware: 'auth', ssr: false })
useHead({ title: 'Admin Workspace | BahayHub Butuan' })

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

// Guard admin workspace
watch(() => auth.user, u => {
  if (u && u.role !== 'admin') router.replace('/account')
  if (!u) router.replace('/login?role=admin')
}, { immediate: true })

const activeTab = ref('overview')
const tabs = [
  { id: 'overview',       label: 'Overview' },
  { id: 'client-reqs',   label: 'Client requests' },
  { id: 'agents',         label: 'Agents' },
  { id: 'listing-review', label: 'Listing review' },
  { id: 'appts-offers',   label: 'Appointments / Offers' },
  { id: 'activity',       label: 'Activity' },
]

// --- Admin Reactive State ---

// 1. Registered Agents
interface RegisteredAgent {
  id: string
  name: string
  email: string
  phone: string
  license: string
  specialization: string
  verified: boolean
  activeListings: number
  closedDeals: number
  rating: number
}

const agentsList = ref<RegisteredAgent[]>([
  {
    id: 'AGT-01',
    name: 'Sarah Jenkins',
    email: 'sarah.j@bahayhub.test',
    phone: '+63 917 111 2233',
    license: 'PRC REB #0024910',
    specialization: 'Residential Sales & Condos',
    verified: true,
    activeListings: 6,
    closedDeals: 28,
    rating: 4.9
  },
  {
    id: 'AGT-02',
    name: 'Michael Chang',
    email: 'michael.c@bahayhub.test',
    phone: '+63 918 222 3344',
    license: 'PRC REB #0031822',
    specialization: 'Commercial Spaces & Warehouses',
    verified: true,
    activeListings: 4,
    closedDeals: 19,
    rating: 4.8
  },
  {
    id: 'AGT-03',
    name: 'Carlos Morales',
    email: 'carlos.m@bahayhub.test',
    phone: '+63 919 333 4455',
    license: 'PRC REB #0028741',
    specialization: 'High-End Estates & Land',
    verified: true,
    activeListings: 3,
    closedDeals: 15,
    rating: 4.9
  },
  {
    id: 'AGT-04',
    name: 'Elena Torres',
    email: 'elena.t@bahayhub.test',
    phone: '+63 920 444 5566',
    license: 'PRC REB #0040192',
    specialization: 'Pre-selling & Townhouses',
    verified: false,
    activeListings: 2,
    closedDeals: 6,
    rating: 4.7
  }
])

function toggleAgentVerification(a: RegisteredAgent) {
  a.verified = !a.verified
  const msg = a.verified
    ? `Agent ${a.name} verified! Credentials confirmed.`
    : `Agent ${a.name} marked as Pending Verification.`
  ui.toast(msg, a.verified ? 'success' : 'info')
  logActivity('Agents', `Admin updated verification status for ${a.name} to ${a.verified ? 'Verified' : 'Pending'}`)
}

const showAddAgentModal = ref(false)
const newAgentForm = reactive({
  name: '',
  email: '',
  phone: '',
  license: '',
  specialization: 'Residential Sales'
})

function addAgent() {
  if (!newAgentForm.name.trim() || !newAgentForm.email.trim()) {
    ui.toast('Please provide agent name and email.', 'error')
    return
  }
  agentsList.value.unshift({
    id: `AGT-${(agentsList.value.length + 1).toString().padStart(2, '0')}`,
    name: newAgentForm.name,
    email: newAgentForm.email,
    phone: newAgentForm.phone || '+63 917 000 0000',
    license: newAgentForm.license || 'PRC REB #0000000',
    specialization: newAgentForm.specialization,
    verified: true,
    activeListings: 0,
    closedDeals: 0,
    rating: 5.0
  })
  ui.toast(`Agent ${newAgentForm.name} registered and verified.`, 'success')
  logActivity('Agents', `New agent ${newAgentForm.name} onboarded by Admin`)
  showAddAgentModal.value = false
  newAgentForm.name = ''
  newAgentForm.email = ''
  newAgentForm.phone = ''
  newAgentForm.license = ''
}

// 2. Client Requests Master Queue
interface AdminRequest {
  id: string
  client: string
  phone: string
  email: string
  property: string
  statusTag: 'New' | 'Unassigned' | 'Assigned' | 'In Progress' | 'Resolved'
  assignedAgent: string
  priority: 'High' | 'Normal' | 'Urgent'
  date: string
}

const requests = ref<AdminRequest[]>([
  {
    id: 'REQ-1001',
    client: 'Client A (Maria Santos)',
    phone: '+63 917 555 0192',
    email: 'maria.santos@gmail.com',
    property: 'Uptown Butuan 2BR Condominium',
    statusTag: 'New',
    assignedAgent: 'Sarah Jenkins',
    priority: 'Normal',
    date: 'Oct 18, 2026'
  },
  {
    id: 'REQ-1062',
    client: 'Client B (Carlos Mendoza)',
    phone: '+63 928 441 8890',
    email: 'carlos.m@yahoo.com',
    property: 'Downtown Butuan Executive Loft',
    statusTag: 'Unassigned',
    assignedAgent: 'Unassigned',
    priority: 'High',
    date: 'Oct 18, 2026'
  },
  {
    id: 'REQ-1063',
    client: 'Client C (Dr. Leah Gonzales)',
    phone: '+63 905 123 9988',
    email: 'leah.g@outlook.com',
    property: 'Modern Tropical House with Pool',
    statusTag: 'Assigned',
    assignedAgent: 'Michael Chang',
    priority: 'Urgent',
    date: 'Oct 17, 2026'
  },
  {
    id: 'REQ-1070',
    client: 'Engr. Roberto Gomez',
    phone: '+63 917 882 1010',
    email: 'roberto.g@gmail.com',
    property: 'J.C. Aquino Commercial Building',
    statusTag: 'In Progress',
    assignedAgent: 'Carlos Morales',
    priority: 'High',
    date: 'Oct 16, 2026'
  },
  {
    id: 'REQ-1075',
    client: 'Atty. Sofia Reyes',
    phone: '+63 922 776 5432',
    email: 'sofia.r@lawfirm.ph',
    property: 'Riverside Modern Villa - Doongan',
    statusTag: 'Resolved',
    assignedAgent: 'Sarah Jenkins',
    priority: 'Normal',
    date: 'Oct 15, 2026'
  }
])

const reqSearch = ref('')
const reqStatusFilter = ref<string>('All')

const filteredRequests = computed(() => {
  return requests.value.filter(r => {
    const matchStatus = reqStatusFilter.value === 'All' || r.statusTag === reqStatusFilter.value
    const matchSearch = !reqSearch.value.trim() ||
      r.id.toLowerCase().includes(reqSearch.value.toLowerCase()) ||
      r.client.toLowerCase().includes(reqSearch.value.toLowerCase()) ||
      r.property.toLowerCase().includes(reqSearch.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

function assignAgentToRequest(req: AdminRequest, agentName: string) {
  req.assignedAgent = agentName
  req.statusTag = agentName === 'Unassigned' ? 'Unassigned' : 'Assigned'
  ui.toast(`Request ${req.id} assigned to ${agentName}.`, 'success')
  logActivity('Inquiries', `Assigned ${req.id} to ${agentName}`)
}

function resolveRequest(req: AdminRequest) {
  req.statusTag = 'Resolved'
  ui.toast(`Request ${req.id} marked as Resolved.`, 'success')
  logActivity('Inquiries', `Request ${req.id} closed as Resolved by Admin`)
}

// 3. Listing Review Queue
interface ModerationListing {
  id: string
  title: string
  location: string
  price: string
  type: string
  submittedBy: string
  submittedDate: string
  status: 'Awaiting Review' | 'Approved & Published' | 'Needs Revision' | 'Rejected'
  notes: string
}

const moderationListings = ref<ModerationListing[]>([
  {
    id: 'LST-201',
    title: 'Riverside Modern Villa - Doongan',
    location: 'Doongan, Butuan City',
    price: '₱9,200,000',
    type: 'Single Family Villa',
    submittedBy: 'Elena Torres',
    submittedDate: 'Oct 18, 2026',
    status: 'Awaiting Review',
    notes: 'Submitted for verification with title deed and tax declaration attached.'
  },
  {
    id: 'LST-202',
    title: 'Montilla Blvd Commercial Space',
    location: 'Montilla Blvd, Butuan City',
    price: '₱60,000 / mo',
    type: 'Commercial',
    submittedBy: 'Michael Chang',
    submittedDate: 'Oct 17, 2026',
    status: 'Approved & Published',
    notes: 'Commercial zoning clearance verified with Butuan City Hall.'
  },
  {
    id: 'LST-203',
    title: 'Ampayon Agricultural / Commercial Land',
    location: 'Ampayon Highway, Butuan City',
    price: '₱18,500,000',
    type: 'Commercial Lot',
    submittedBy: 'Carlos Morales',
    submittedDate: 'Oct 16, 2026',
    status: 'Approved & Published',
    notes: 'Clean title verified. Road right-of-way confirmed.'
  },
  {
    id: 'LST-204',
    title: 'Bancasi 3BR Family Bungalow',
    location: 'Bancasi, Butuan City',
    price: '₱5,800,000',
    type: 'Residential House',
    submittedBy: 'Sarah Jenkins',
    submittedDate: 'Oct 15, 2026',
    status: 'Needs Revision',
    notes: 'Please attach updated floor layout and clear copy of building permit.'
  }
])

const modFilter = ref<string>('All')
const filteredModeration = computed(() => {
  if (modFilter.value === 'All') return moderationListings.value
  return moderationListings.value.filter(l => l.status === modFilter.value)
})

function setListingStatus(item: ModerationListing, s: ModerationListing['status']) {
  item.status = s
  if (s === 'Approved & Published') {
    ui.toast(`Listing ${item.id} (${item.title}) approved and published!`, 'success')
    logActivity('Listings', `Admin published listing ${item.id}: ${item.title}`)
  } else if (s === 'Needs Revision') {
    ui.toast(`Revision requested for listing ${item.id}.`, 'info')
    logActivity('Listings', `Admin requested revision for listing ${item.id}`)
  } else {
    ui.toast(`Listing ${item.id} marked as ${s}.`, 'info')
  }
}

// 4. Appointments & Offers Monitor
interface AdminAppointment {
  id: string
  client: string
  agent: string
  property: string
  date: string
  time: string
  status: 'Confirmed' | 'Pending' | 'Completed'
}

const adminAppts = ref<AdminAppointment[]>([
  { id: 'AP-1', client: 'Maria Santos', agent: 'Sarah Jenkins', property: 'Uptown Butuan 2BR Condominium', date: 'Oct 19, 2026', time: '10:00 AM', status: 'Confirmed' },
  { id: 'AP-2', client: 'Carlos Mendoza', agent: 'Michael Chang', property: 'Downtown Butuan Executive Loft', date: 'Oct 21, 2026', time: '02:30 PM', status: 'Pending' },
  { id: 'AP-3', client: 'Dr. Leah Gonzales', agent: 'Carlos Morales', property: 'Modern Tropical House with Pool', date: 'Oct 24, 2026', time: '09:00 AM', status: 'Confirmed' },
  { id: 'AP-4', client: 'Engr. Roberto Gomez', agent: 'Carlos Morales', property: 'J.C. Aquino Commercial Space', date: 'Oct 25, 2026', time: '03:00 PM', status: 'Confirmed' }
])

interface AdminOffer {
  id: string
  property: string
  buyer: string
  agent: string
  askingPrice: string
  offeredAmount: string
  status: 'Pending Review' | 'Accepted' | 'Countered' | 'Declined'
}

const adminOffers = ref<AdminOffer[]>([
  { id: 'OF-8801', property: 'Uptown Butuan 2BR Condominium', buyer: 'Engr. Roberto Gomez', agent: 'Sarah Jenkins', askingPrice: '₱4,500,000', offeredAmount: '₱4,250,000', status: 'Pending Review' },
  { id: 'OF-8794', property: 'Downtown Butuan Executive Loft', buyer: 'Carlos Mendoza', agent: 'Michael Chang', askingPrice: '₱35,000 / mo', offeredAmount: '₱32,000 / mo', status: 'Countered' },
  { id: 'OF-8750', property: 'Modern Tropical House with Pool', buyer: 'Dr. Leah Gonzales', agent: 'Carlos Morales', askingPrice: '₱12,800,000', offeredAmount: '₱12,500,000', status: 'Accepted' }
])

const apptsOffersMode = ref<'viewings' | 'offers'>('viewings')

// 5. Activity Audit Log
interface ActivityEvent {
  id: string
  category: 'Listings' | 'Agents' | 'Inquiries' | 'System'
  title: string
  time: string
  badgeColor: string
}

const activityEvents = ref<ActivityEvent[]>([
  { id: 'EV-101', category: 'Inquiries', title: 'Request REQ-1062 assigned to Agent Carlos Morales', time: '10 mins ago', badgeColor: 'orange' },
  { id: 'EV-102', category: 'Agents', title: 'Agent Sarah Jenkins PRC License renewed & verified', time: '35 mins ago', badgeColor: 'green' },
  { id: 'EV-103', category: 'Listings', title: 'Listing LST-202 (Montilla Blvd Commercial) published to directory', time: '2 hours ago', badgeColor: 'blue' },
  { id: 'EV-104', category: 'Inquiries', title: 'New buyer inquiry submitted for Uptown Butuan 2BR Condominium', time: '3 hours ago', badgeColor: 'orange' },
  { id: 'EV-105', category: 'System', title: 'Local database state snapshot saved in browser storage', time: '5 hours ago', badgeColor: 'navy' }
])

const activityFilter = ref<string>('All')
const filteredActivity = computed(() => {
  if (activityFilter.value === 'All') return activityEvents.value
  return activityEvents.value.filter(e => e.category === activityFilter.value)
})

function logActivity(cat: ActivityEvent['category'], title: string) {
  activityEvents.value.unshift({
    id: `EV-${Date.now().toString().slice(-4)}`,
    category: cat,
    title,
    time: 'Just now',
    badgeColor: cat === 'Agents' ? 'green' : cat === 'Listings' ? 'blue' : 'orange'
  })
}

const newAuditNote = ref('')
function addAuditNote() {
  if (!newAuditNote.value.trim()) return
  logActivity('System', `Admin Note: ${newAuditNote.value.trim()}`)
  ui.toast('Audit note logged.', 'success')
  newAuditNote.value = ''
}

function exportAuditLog() {
  const jsonStr = JSON.stringify(activityEvents.value, null, 2)
  if (navigator.clipboard) {
    navigator.clipboard.writeText(jsonStr)
    ui.toast('Audit log copied to clipboard as JSON!', 'success')
  } else {
    ui.toast('Audit log ready for export.', 'info')
  }
}

// Stats computed
const publishedCount = computed(() => moderationListings.value.filter(l => l.status === 'Approved & Published').length + 3)
const reviewCount = computed(() => moderationListings.value.filter(l => l.status === 'Awaiting Review').length)
const verifiedAgentsCount = computed(() => agentsList.value.filter(a => a.verified).length)
const openReqCount = computed(() => requests.value.filter(r => r.statusTag !== 'Resolved').length)

function signOut() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div v-if="auth.user && auth.user.role === 'admin'" class="ws-page">

    <!-- Hero Banner -->
    <div class="ws-hero">
      <div class="wrap ws-hero-in">
        <div class="ws-hero-left">
          <p class="ws-eyebrow">Admin Workspace <span class="ws-dot">·</span> Butuan City Executive</p>
          <h1 class="ws-title ws-title-lg">Keep the Butuan workspace moving.</h1>
          <p class="ws-sub">Coordinate client inquiry routing, agent verification, listing review moderation, and viewing schedules from one centralized hub.</p>
        </div>
        <div class="ws-hero-card ws-hero-card-warn">
          <p class="ws-signed-label">Platform Control Panel</p>
          <p class="ws-signed-email">{{ auth.user.email }}</p>
          <p class="ws-signed-note">All actions update client &amp; agent routes in real-time.</p>
          <button class="btn btn-ghost btn-sm ws-signout" style="margin-top:10px" @click="signOut">Sign out</button>
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
            <span v-if="tab.id === 'client-reqs' && openReqCount > 0" class="ws-tab-badge">{{ openReqCount }}</span>
            <span v-else-if="tab.id === 'listing-review' && reviewCount > 0" class="ws-tab-badge">{{ reviewCount }}</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Workspace Content -->
    <div class="wrap ws-body">

      <!-- ================= TAB: OVERVIEW ================= -->
      <section v-if="activeTab === 'overview'" class="ws-panel-fade">
        <!-- Stat Cards -->
        <div class="ws-stats ws-stats-4">
          <div class="ws-stat clickable" @click="activeTab = 'listing-review'">
            <div class="ws-stat-top">
              <span class="ws-stat-label">Published listings</span>
              <span class="ws-stat-icon-circle" style="color:#3b82f6">🔔</span>
            </div>
            <div class="ws-stat-val">{{ publishedCount }}</div>
            <div class="ws-stat-sub">Active in Butuan City directory</div>
          </div>

          <div class="ws-stat clickable" @click="activeTab = 'listing-review'">
            <div class="ws-stat-top">
              <span class="ws-stat-label">Awaiting review</span>
              <span class="ws-stat-icon-circle" style="color:#f59e0b">⏰</span>
            </div>
            <div class="ws-stat-val">{{ reviewCount }}</div>
            <div class="ws-stat-sub">Submitted by local agents</div>
          </div>

          <div class="ws-stat clickable" @click="activeTab = 'agents'">
            <div class="ws-stat-top">
              <span class="ws-stat-label">Agents verified</span>
              <span class="ws-stat-icon-circle" style="color:#22c55e">✔</span>
            </div>
            <div class="ws-stat-val">{{ verifiedAgentsCount }} / {{ agentsList.length }}</div>
            <div class="ws-stat-sub">PRC real estate licenses checked</div>
          </div>

          <div class="ws-stat clickable" @click="activeTab = 'client-reqs'">
            <div class="ws-stat-top">
              <span class="ws-stat-label">Open client requests</span>
              <span class="ws-stat-icon-circle" style="color:#f97316">✏</span>
            </div>
            <div class="ws-stat-val">{{ openReqCount }}</div>
            <div class="ws-stat-sub">In queue needing agent assignment</div>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="ws-grid2 ws-grid2-wide">

          <!-- Assignment Authority -->
          <div class="ws-card">
            <div class="ws-card-header">
              <div>
                <p class="ws-card-eyebrow">Assignment Authority</p>
                <h3 class="ws-card-title">Client requests need an owner</h3>
                <p class="ws-card-sub">Assign any request to one of the verified Agents. The shared local record is immediately visible in the Agent route.</p>
              </div>
              <button class="btn btn-orange btn-sm ws-queue-btn" @click="activeTab = 'client-reqs'">Open full request queue →</button>
            </div>

            <div class="ws-req-list">
              <div v-for="r in requests.slice(0, 3)" :key="r.id" class="ws-req-row">
                <div class="ws-req-info">
                  <b>{{ r.id }}</b>
                  <p>{{ r.client }} · {{ r.property }}</p>
                  <small style="color:var(--muted)">Assigned: <b style="color:var(--navy)">{{ r.assignedAgent }}</b></small>
                </div>
                <div class="ws-req-badges">
                  <span :class="['ws-badge', r.statusTag === 'New' ? 'ws-badge-green' : r.statusTag === 'Unassigned' ? 'ws-badge-orange' : 'ws-badge-blue']">
                    {{ r.statusTag }}
                  </span>
                  <span class="ws-badge ws-badge-outline">{{ r.priority }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Local Coverage -->
          <div class="ws-card ws-coverage">
            <p class="ws-card-eyebrow">Local Coverage</p>
            <h3 class="ws-card-title">Butuan City</h3>
            <p class="ws-card-sub" style="margin-bottom:14px">Records are limited to Butuan City. Admin actions are saved in this browser and update live.</p>
            <div class="ws-map-placeholder">
              <div class="ws-map-inner">
                <span class="ws-map-pin" style="top:42%;left:55%">📍</span>
                <span class="ws-map-pin" style="top:62%;left:38%">📍</span>
                <span class="ws-map-pin" style="top:35%;left:25%">📍</span>
                <p class="ws-map-label">Butuan City<br><small>Agusan del Norte · Caraga</small></p>
              </div>
            </div>
            <div class="ws-coverage-stats">
              <div class="ws-coverage-row"><span>Total Audit Events</span><b>{{ activityEvents.length }}</b></div>
              <div class="ws-coverage-row"><span>Registered Agents</span><b>{{ agentsList.length }}</b></div>
              <div class="ws-coverage-row"><span>Platform Viewings</span><b>{{ adminAppts.length }}</b></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TAB: CLIENT REQUESTS ================= -->
      <section v-else-if="activeTab === 'client-reqs'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Inquiry Routing Queue</p>
            <h2 class="ws-section-title">Master Client Requests ({{ filteredRequests.length }})</h2>
            <p class="ws-section-sub">Direct buyer inquiries across all Butuan properties. Assign agents or update progress.</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <input
              v-model="reqSearch"
              class="input"
              placeholder="Search by client or property..."
              style="width:240px;height:36px;border-radius:50px;padding:0 16px"
            />
            <div class="ws-filter-pills">
              <button
                v-for="s in ['All', 'Unassigned', 'Assigned', 'In Progress', 'Resolved']" :key="s"
                :class="['pill', { 'active-pill': reqStatusFilter === s }]"
                :aria-pressed="reqStatusFilter === s"
                @click="reqStatusFilter = s"
              >
                {{ s }}
              </button>
            </div>
          </div>
        </div>

        <div class="ws-cards-stack">
          <div v-for="r in filteredRequests" :key="r.id" class="ws-card ws-req-detail-card">
            <div class="ws-req-top">
              <div>
                <span class="ws-badge ws-badge-navy">{{ r.id }}</span>
                <span :class="['ws-badge', r.statusTag === 'New' ? 'ws-badge-green' : r.statusTag === 'Unassigned' ? 'ws-badge-orange' : r.statusTag === 'Assigned' ? 'ws-badge-blue' : 'ws-badge-outline']" style="margin-left:6px">
                  {{ r.statusTag }}
                </span>
                <span :class="['ws-badge', r.priority === 'Urgent' ? 'ws-badge-orange' : 'ws-badge-outline']" style="margin-left:4px">
                  {{ r.priority }} Priority
                </span>
                <h3 style="font-size:17px;font-weight:700;color:var(--ink);margin-top:8px">{{ r.client }}</h3>
                <p style="font-size:13px;color:var(--muted)">Target Property: <b style="color:var(--navy)">{{ r.property }}</b></p>
              </div>

              <div class="ws-req-contact-info">
                <span>📞 {{ r.phone }}</span>
                <span>✉ {{ r.email }}</span>
                <small style="color:var(--muted)">Received: {{ r.date }}</small>
              </div>
            </div>

            <div class="ws-req-actions-bar" style="background:var(--bg);border-radius:12px;padding:12px;margin-top:12px">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                <span style="font-weight:700;font-size:12.5px;color:var(--navy)">Assign Agent:</span>
                <select
                  class="select-plain"
                  style="width:220px;height:34px;border-radius:50px;padding:0 14px;background:#fff"
                  :value="r.assignedAgent"
                  @change="assignAgentToRequest(r, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="Unassigned">-- Unassigned --</option>
                  <option v-for="a in agentsList" :key="a.id" :value="a.name">
                    {{ a.name }} ({{ a.verified ? 'Verified' : 'Pending' }})
                  </option>
                </select>
              </div>

              <div class="ws-req-btn-group">
                <button
                  v-if="r.statusTag !== 'Resolved'"
                  class="btn btn-navy btn-sm"
                  @click="resolveRequest(r)"
                >
                  ✔ Mark Resolved
                </button>
                <button
                  class="btn btn-ghost btn-sm"
                  @click="r.priority = r.priority === 'Urgent' ? 'Normal' : 'Urgent'; ui.toast(`Priority set to ${r.priority}`, 'info')"
                >
                  ⚡ Toggle Priority
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TAB: AGENTS ================= -->
      <section v-else-if="activeTab === 'agents'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Professional Directory</p>
            <h2 class="ws-section-title">Registered Butuan Agents ({{ agentsList.length }})</h2>
            <p class="ws-section-sub">PRC real estate broker verification, active assignments, and production metrics.</p>
          </div>
          <button class="btn btn-orange btn-sm" @click="showAddAgentModal = true">+ Register New Agent</button>
        </div>

        <!-- Add Agent Inline / Modal -->
        <div v-if="showAddAgentModal" class="ws-card ws-form-card" style="margin-bottom:20px">
          <div class="ws-card-header">
            <h3>Register New Real Estate Agent</h3>
            <button class="btn btn-ghost btn-sm" @click="showAddAgentModal = false">Cancel</button>
          </div>
          <form class="ws-form-grid" @submit.prevent="addAgent">
            <div class="form-row">
              <label>Agent Full Name</label>
              <input v-model="newAgentForm.name" class="input" placeholder="e.g. Maria Clara" required />
            </div>
            <div class="form-row">
              <label>Email Address</label>
              <input v-model="newAgentForm.email" type="email" class="input" placeholder="agent@bahayhub.test" required />
            </div>
            <div class="form-row">
              <label>Phone Number</label>
              <input v-model="newAgentForm.phone" class="input" placeholder="+63 917 000 0000" />
            </div>
            <div class="form-row">
              <label>PRC License Number</label>
              <input v-model="newAgentForm.license" class="input" placeholder="PRC REB #0000000" />
            </div>
            <div class="form-row" style="grid-column:1/-1">
              <label>Specialization</label>
              <input v-model="newAgentForm.specialization" class="input" placeholder="e.g. Condominium & Commercial Leases" />
            </div>
            <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:10px">
              <button type="button" class="btn btn-ghost btn-sm" @click="showAddAgentModal = false">Cancel</button>
              <button type="submit" class="btn btn-navy btn-sm">Save Agent</button>
            </div>
          </form>
        </div>

        <div class="ws-grid2">
          <div v-for="a in agentsList" :key="a.id" class="ws-card ws-agent-item-card">
            <div class="ws-agent-header">
              <div class="avatar" style="width:48px;height:48px;font-size:18px">{{ a.name.split(' ').map(n => n[0]).join('') }}</div>
              <div style="flex:1">
                <div style="display:flex;align-items:center;gap:8px">
                  <h3 style="font-size:16px;font-weight:700;color:var(--ink)">{{ a.name }}</h3>
                  <span :class="['ws-badge', a.verified ? 'ws-badge-green' : 'ws-badge-orange']">
                    {{ a.verified ? '✔ Verified' : '⏳ Pending' }}
                  </span>
                </div>
                <p style="font-size:12.5px;color:var(--navy);font-weight:600">{{ a.license }}</p>
                <p style="font-size:12px;color:var(--muted)">{{ a.specialization }}</p>
              </div>
            </div>

            <div class="ws-agent-metrics-row">
              <div class="ws-agent-metric"><span>Active Listings</span><b>{{ a.activeListings }}</b></div>
              <div class="ws-agent-metric"><span>Closed Deals</span><b>{{ a.closedDeals }}</b></div>
              <div class="ws-agent-metric"><span>Client Rating</span><b>{{ a.rating }} ★</b></div>
            </div>

            <div class="ws-agent-contact-box">
              <span>✉ {{ a.email }}</span>
              <span>📞 {{ a.phone }}</span>
            </div>

            <div class="ws-agent-actions">
              <button
                class="btn btn-sm"
                :class="a.verified ? 'btn-ghost' : 'btn-navy'"
                @click="toggleAgentVerification(a)"
              >
                {{ a.verified ? 'Revoke Verification' : 'Verify Agent License' }}
              </button>
              <button class="btn btn-soft btn-sm" @click="activeTab = 'client-reqs'; reqSearch = a.name">
                View Queue
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TAB: LISTING REVIEW ================= -->
      <section v-else-if="activeTab === 'listing-review'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Listing Moderation</p>
            <h2 class="ws-section-title">Listing Review Queue ({{ filteredModeration.length }})</h2>
            <p class="ws-section-sub">Verify property legal compliance, titles, and agent submissions before publishing to Butuan buyers.</p>
          </div>
          <div class="ws-filter-pills">
            <button
              v-for="f in ['All', 'Awaiting Review', 'Approved & Published', 'Needs Revision']" :key="f"
              :class="['pill', { 'active-pill': modFilter === f }]"
              :aria-pressed="modFilter === f"
              @click="modFilter = f"
            >
              {{ f }}
            </button>
          </div>
        </div>

        <div class="ws-cards-stack">
          <div v-for="l in filteredModeration" :key="l.id" class="ws-card ws-mod-card">
            <div class="ws-mod-top">
              <div>
                <span class="ws-badge ws-badge-navy">{{ l.id }}</span>
                <span :class="['ws-badge', l.status === 'Approved & Published' ? 'ws-badge-green' : l.status === 'Awaiting Review' ? 'ws-badge-orange' : 'ws-badge-blue']" style="margin-left:6px">
                  {{ l.status }}
                </span>
                <h3 style="font-size:17px;font-weight:700;color:var(--ink);margin-top:6px">{{ l.title }}</h3>
                <p style="font-size:13px;color:var(--muted)">📍 {{ l.location }} · {{ l.type }} · Submitting Agent: <b style="color:var(--navy)">{{ l.submittedBy }}</b></p>
              </div>

              <div class="ws-mod-price">
                <span style="font-size:18px;font-family:var(--font-head);font-weight:800;color:var(--ink)">{{ l.price }}</span>
                <small style="color:var(--muted)">Submitted {{ l.submittedDate }}</small>
              </div>
            </div>

            <div class="ws-mod-notes">
              <b>Compliance Notes:</b> {{ l.notes }}
            </div>

            <div class="ws-mod-actions">
              <button
                v-if="l.status !== 'Approved & Published'"
                class="btn btn-navy btn-sm"
                @click="setListingStatus(l, 'Approved & Published')"
              >
                ✔ Approve &amp; Publish
              </button>
              <button
                v-if="l.status !== 'Needs Revision'"
                class="btn btn-ghost btn-sm"
                @click="setListingStatus(l, 'Needs Revision')"
              >
                📝 Request Revision
              </button>
              <button
                v-if="l.status !== 'Rejected'"
                class="btn btn-soft btn-sm"
                @click="setListingStatus(l, 'Rejected')"
              >
                ✖ Reject
              </button>
              <button class="btn btn-ghost btn-sm" style="margin-left:auto" @click="ui.toast('Showing full document package...', 'info')">
                📄 View Title &amp; Tax Docs
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TAB: APPOINTMENTS & OFFERS ================= -->
      <section v-else-if="activeTab === 'appts-offers'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Platform Transactions</p>
            <h2 class="ws-section-title">Platform Viewings &amp; Offers</h2>
            <p class="ws-section-sub">Oversight of active viewing tours and submitted purchase contracts across Butuan.</p>
          </div>
          <div class="seg" role="group">
            <button type="button" :aria-pressed="apptsOffersMode === 'viewings'" @click="apptsOffersMode = 'viewings'">
              Property Viewings ({{ adminAppts.length }})
            </button>
            <button type="button" :aria-pressed="apptsOffersMode === 'offers'" @click="apptsOffersMode = 'offers'">
              Purchase Offers ({{ adminOffers.length }})
            </button>
          </div>
        </div>

        <!-- Viewings Table -->
        <div v-if="apptsOffersMode === 'viewings'" class="ws-card">
          <h3 class="ws-card-title" style="margin-bottom:14px">Active Platform Tour Schedules</h3>
          <div class="ws-req-list">
            <div v-for="a in adminAppts" :key="a.id" class="ws-req-row">
              <div class="ws-req-info">
                <b>{{ a.property }}</b>
                <p>Client: {{ a.client }} · Assigned Agent: <b style="color:var(--navy)">{{ a.agent }}</b></p>
                <small style="color:var(--muted)">📅 {{ a.date }} at {{ a.time }}</small>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span :class="['ws-badge', a.status === 'Confirmed' ? 'ws-badge-green' : 'ws-badge-orange']">{{ a.status }}</span>
                <button
                  class="btn btn-ghost btn-sm"
                  @click="a.status = a.status === 'Confirmed' ? 'Completed' : 'Confirmed'; ui.toast(`Appointment marked as ${a.status}`, 'info')"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Offers Table -->
        <div v-else class="ws-card">
          <h3 class="ws-card-title" style="margin-bottom:14px">Platform Purchase &amp; Lease Offers</h3>
          <div class="ws-req-list">
            <div v-for="o in adminOffers" :key="o.id" class="ws-req-row">
              <div class="ws-req-info">
                <b>{{ o.property }}</b>
                <p>Buyer: {{ o.buyer }} · Agent: <b style="color:var(--navy)">{{ o.agent }}</b></p>
                <small style="color:var(--muted)">Asking: {{ o.askingPrice }}</small>
              </div>
              <div style="text-align:right">
                <div style="font-size:16px;font-weight:800;color:var(--navy);font-family:var(--font-head)">{{ o.offeredAmount }}</div>
                <span :class="['ws-badge', o.status === 'Accepted' ? 'ws-badge-green' : o.status === 'Countered' ? 'ws-badge-blue' : 'ws-badge-orange']" style="margin-top:4px">
                  {{ o.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TAB: ACTIVITY AUDIT ================= -->
      <section v-else-if="activeTab === 'activity'" class="ws-panel-fade">
        <div class="ws-section-header-row">
          <div>
            <p class="ws-section-eyebrow">Audit &amp; Compliance</p>
            <h2 class="ws-section-title">System Activity Log ({{ filteredActivity.length }})</h2>
            <p class="ws-section-sub">Chronological audit trail of admin actions, routing decisions, and status updates.</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center">
            <div class="ws-filter-pills">
              <button
                v-for="f in ['All', 'Listings', 'Agents', 'Inquiries', 'System']" :key="f"
                :class="['pill', { 'active-pill': activityFilter === f }]"
                :aria-pressed="activityFilter === f"
                @click="activityFilter = f"
              >
                {{ f }}
              </button>
            </div>
            <button class="btn btn-ghost btn-sm" @click="exportAuditLog">📋 Copy JSON</button>
          </div>
        </div>

        <!-- Add Manual Audit Note -->
        <div class="ws-card" style="margin-bottom:18px;padding:16px">
          <form style="display:flex;gap:10px;align-items:center" @submit.prevent="addAuditNote">
            <input
              v-model="newAuditNote"
              class="input"
              placeholder="Record an administrative audit remark..."
              style="border-radius:50px;height:40px"
            />
            <button type="submit" class="btn btn-navy btn-sm" style="height:40px;padding:0 20px">
              + Log Note
            </button>
          </form>
        </div>

        <div class="ws-card">
          <div class="ws-activity-list">
            <div v-for="ev in filteredActivity" :key="ev.id" class="ws-activity-row">
              <span :class="['ws-badge', `ws-badge-${ev.badgeColor}`]">{{ ev.category }}</span>
              <div class="ws-activity-content">
                <p>{{ ev.title }}</p>
                <small>{{ ev.time }}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>
