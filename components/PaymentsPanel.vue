<script setup lang="ts">
import type { PayStatus } from '~/stores/payments'

// Agent: "My deals" (own deals, read-only status). Admin: "Payment log" (all deals, status dropdown).
const props = defineProps<{ mode: 'agent' | 'admin'; summary?: boolean }>()
const pay = usePaymentStore()
const auth = useAuthStore()
const ui = useUiStore()
useFocusRow()

const admin = props.mode === 'admin'
const me = computed(() => auth.user?.name ?? '')
const list = computed(() => (admin ? pay.items : pay.items.filter(p => p.agent === me.value)))
const filter = ref<'All' | 'Sale' | 'Rent'>('All')
const rows = computed(() => list.value.filter(p => filter.value === 'All' || p.type === filter.value))
const all = computed(() => totals(list.value))
const sale = computed(() => totals(list.value, 'Sale'))
const agents = computed(() => [...new Set(pay.items.map(p => p.agent))])
const showModal = ref(false)
const ready = ref(false) // short skeleton on first view
onMounted(() => setTimeout(() => (ready.value = true), 350))

const kpis = computed(() => admin
  ? [
      { l: 'Total paid', v: all.value.paidAmount, s: 'Payments marked Paid', i: 'cash' },
      { l: 'Commission earned', v: all.value.earned, s: '10% of paid sales and rent', i: 'building', o: true },
      { l: 'Pending', v: all.value.pendingAmount, s: 'Waiting to be marked Paid', i: 'bell' },
      { l: 'Payments logged', v: list.value.length, s: 'Every payment on record', i: 'check', n: true }
    ]
  : [
      { l: 'Commission earned', v: all.value.earned, s: 'Paid deals only', i: 'cash', o: true },
      { l: 'Commission pending', v: all.value.pendingCommission, s: 'Waiting for admin approval', i: 'bell' },
      { l: 'Sale deals', v: sale.value.count, s: 'Sales you recorded', i: 'building', n: true },
      { l: 'Rent deals', v: totals(list.value, 'Rent').count, s: 'Rentals you recorded', i: 'home', n: true }
    ])

const amountText = (p: (typeof pay.items)[number]) =>
  p.type === 'Rent' ? `${pesoC(p.monthlyRent ?? 0)}/month x ${p.leaseMonths} months` : pesoC(p.amount)

function change(id: string, e: Event) {
  const v = (e.target as HTMLSelectElement).value as PayStatus
  pay.setStatus(id, v, 'Admin')
  ui.toast(`${id} marked ${v}.`, 'success')
  setTimeout(() => (pay.changedId = ''), 600)
}
function exportCsv() {
  downloadCsv('bahayhub-payments.csv', [
    ['ID', 'Date', 'Type', 'Client', 'Property', 'Location', 'Agent', 'Amount', 'Commission', 'Status'],
    ...rows.value.map(p => [p.id, p.date, p.type, p.clientName, p.propertyTitle, p.location, p.agent, p.amount, p.commission, p.status])
  ])
}
const viewing = ref('')
const cur = computed(() => pay.items.find(p => p.id === viewing.value))
function setStatus(id: string, v: PayStatus) { pay.setStatus(id, v, 'Admin'); ui.toast(`${id} marked ${v}.`, 'success'); viewing.value = '' }
const countFmt = (n: number) => String(n)
</script>

<template>
  <div class="ws-panel-fade">
    <div class="ws-stats">
      <div v-for="(k, i) in kpis" :key="k.l" v-reveal="i" class="ws-stat">
        <div class="ws-stat-top"><span class="ws-stat-label">{{ k.l }}</span><span class="ws-stat-icon"><Icon :name="k.i" /></span></div>
        <div class="ws-stat-val" :class="{ 'x-orange': k.o }"><CountUp :value="k.v" :fmt="k.n ? countFmt : undefined" /></div>
        <div class="ws-stat-sub">{{ k.s }}</div>
      </div>
    </div>

    <div class="x-split" :class="{ one: !admin }">
      <CommissionPanel v-if="summary" :mode="mode" />
      <div v-else class="ws-card">
        <div class="ws-card-header">
          <div>
            <p class="ws-card-eyebrow">{{ admin ? 'Payment log' : 'My deals' }}</p>
            <h3 class="ws-card-title">{{ admin ? 'Every payment on record' : 'Every deal under your name' }}</h3>
            <p class="ws-card-sub" style="margin-bottom:0">{{ admin ? 'Admins see all payments and can update their status. Changes are saved in this browser.' : 'New deals stay Pending until an admin marks them Paid. You cannot change a status.' }}</p>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
          <button class="btn btn-orange" @click="showModal = true">{{ admin ? 'Record payment' : 'Record deal' }} →</button>
          <div class="seg" role="group" aria-label="Filter by type">
            <button v-for="f in ['All', 'Sale', 'Rent']" :key="f" type="button" :aria-pressed="filter === f" @click="filter = f as any">{{ f }}</button>
          </div>
          <button v-if="admin" class="btn btn-ghost btn-sm" style="margin-left:auto" @click="exportCsv">Export CSV</button>
        </div>

        <div v-if="!ready" class="x-skel" aria-busy="true"><i v-for="n in 4" :key="n" /></div>
        <p v-else-if="!rows.length" class="x-empty">No {{ filter === 'All' ? '' : filter.toLowerCase() + ' ' }}deals yet. Use “{{ admin ? 'Record payment' : 'Record deal' }}” to add one.</p>
        <TransitionGroup v-else name="row" tag="div" class="x-rows">
          <div v-for="p in rows" :key="p.id" class="x-row" :data-focus="p.id" :class="{ flash: pay.changedId === p.id }">
            <button class="x-row-main x-tap" :aria-label="`View details of ${p.id}`" @click="viewing = p.id">
              <div><b>{{ p.id }}</b> <span class="x-tag" :class="p.type.toLowerCase()">{{ p.type }}</span> <span class="x-muted">{{ fmtDate(p.date) }}</span></div>
              <p class="x-muted" style="font-size:13px">{{ p.clientName }} · {{ p.propertyTitle }}, {{ p.location }}</p>
              <p v-if="p.type === 'Rent'" class="x-muted">{{ amountText(p) }}</p>
              <p v-if="p.status === 'Pending'" class="x-muted">Waiting for admin approval</p>
              <span class="x-more">View details →</span>
            </button>
            <div class="x-row-side">
              <b class="x-amt">{{ pesoC(p.amount) }}</b>
              <span class="x-comm x-comm-sm">Commission {{ pesoC(p.commission) }}</span>
              <template v-if="admin">
                <span class="x-muted">{{ p.agent }}</span>
                <label class="sr-only" :for="'st-' + p.id">Status of {{ p.id }}</label>
                <select :id="'st-' + p.id" class="input x-sel" :value="p.status" @change="change(p.id, $event)">
                  <option>Pending</option><option>Paid</option><option>Refunded</option>
                </select>
              </template>
              <span v-else class="x-pill" :class="p.status.toLowerCase()">{{ p.status }}</span>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <aside v-if="admin" class="ws-card">
        <p class="ws-card-eyebrow">Commission rule</p>
        <h3 class="ws-card-title">{{ Math.round(COMMISSION_RATE * 100) }}% sale · {{ Math.round(COMMISSION_RATE * 100) }}% rent</h3>
        <div class="x-ruleart" aria-hidden="true"><b>Sale price × 10%</b><span>₱6,400,000.00 sale → ₱640,000.00</span><span>Rent: monthly rent × months × 10%</span><small>Butuan City</small></div>
        <p class="ws-card-sub">Sale commission is the sale price x 10%. Rent commission is monthly rent x lease months x 10%. It counts once the payment is marked Paid.</p>
        <p class="x-example">Example: ₱6,400,000 sale → <b>₱640,000</b></p>
        <div class="ws-coverage-stats">
          <div class="ws-coverage-row"><span>Payments logged</span><b>{{ pay.items.length }}</b></div>
          <div class="ws-coverage-row"><span>Agents earning commission</span><b>{{ new Set(pay.items.filter(p => p.status === 'Paid').map(p => p.agent)).size }}</b></div>
          <div class="ws-coverage-row"><span>Refunded payments</span><b>{{ pay.items.filter(p => p.status === 'Refunded').length }}</b></div>
        </div>
        <template v-if="!summary"><p class="ws-card-eyebrow" style="margin-top:16px">Recent activity</p>
        <p v-if="!pay.activity.length" class="x-muted">No changes yet.</p>
        <ul v-else class="x-check"><li v-for="a in pay.activity.slice(0, 5)" :key="a.id">{{ a.text }}</li></ul></template>
      </aside>
    </div>
    <ContextDrawer :open="!!cur" :title="cur?.id ?? ''" eyebrow="Payment details" @close="viewing = ''">
      <template v-if="cur">
        <p><span class="x-pill" :class="cur.status.toLowerCase()">{{ cur.status }}</span> <span class="x-tag" :class="cur.type.toLowerCase()">{{ cur.type }}</span></p>
        <dl class="x-dl">
          <div><dt>Date</dt><dd>{{ fmtDate(cur.date) }}</dd></div>
          <div><dt>Client</dt><dd>{{ cur.clientName }}</dd></div>
          <div><dt>Property</dt><dd>{{ cur.propertyTitle }}, {{ cur.location }}</dd></div>
          <div><dt>Agent</dt><dd>{{ cur.agent }}</dd></div>
          <div><dt>Amount</dt><dd>{{ amountText(cur) }}</dd></div>
          <div><dt>Total</dt><dd>{{ pesoC(cur.amount) }}</dd></div>
          <div><dt>Commission (10%)</dt><dd>{{ pesoC(cur.commission) }}</dd></div>
        </dl>
        <div v-if="admin && cur.status === 'Pending'" style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-navy btn-sm" @click="setStatus(cur.id, 'Paid')">Mark Paid</button>
          <button class="btn btn-ghost btn-sm" @click="setStatus(cur.id, 'Refunded')">Refund</button>
        </div>
      </template>
    </ContextDrawer>
    <PaymentModal v-if="showModal" :admin="admin" :agents="agents" :me="me" @close="showModal = false" />
  </div>
</template>
