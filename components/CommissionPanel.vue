<script setup lang="ts">
// Agent: "My commission" cards. Admin: "Commission summary" with one row per agent.
const props = defineProps<{ mode: 'agent' | 'admin' }>()
const pay = usePaymentStore()
const auth = useAuthStore()
const admin = props.mode === 'admin'
const filter = ref<'All' | 'Sale' | 'Rent'>('All')
const type = computed(() => (filter.value === 'All' ? undefined : filter.value))
const mine = computed(() => pay.items.filter(p => p.agent === auth.user?.name))
const perAgent = computed(() => [...new Set(pay.items.map(p => p.agent))].map(a => {
  const l = pay.items.filter(p => p.agent === a)
  return { a, n: l.filter(p => !type.value || p.type === type.value).length, all: totals(l, type.value), sale: totals(l, 'Sale'), rent: totals(l, 'Rent') }
}))
const sale = computed(() => totals(mine.value, 'Sale'))
const rent = computed(() => totals(mine.value, 'Rent'))
const both = computed(() => totals(mine.value))
</script>

<template>
  <div class="ws-panel-fade">
    <template v-if="!admin">
      <div class="ws-grid2">
        <div v-for="(c, i) in [{ t: 'Sale commission', h: '10% of paid sales', d: sale }, { t: 'Rent commission', h: '10% of paid rent deals', d: rent }]" :key="c.t" v-reveal="i" class="ws-card">
          <p class="ws-card-eyebrow">{{ c.t }}</p><h3 class="ws-card-title" style="font-size:20px;margin-bottom:8px">{{ c.h }}</h3>
          <div class="x-kv"><span>Paid total</span><b>{{ pesoC(c.d.paidAmount) }}</b></div>
          <div class="x-kv"><span>Commission earned</span><b class="x-orange">{{ pesoC(c.d.earned) }}</b></div>
          <div class="x-kv"><span>Commission pending</span><b>{{ pesoC(c.d.pendingCommission) }}</b></div>
        </div>
      </div>
      <div v-reveal="2" class="ws-card x-combined">
        <p class="ws-card-eyebrow" style="grid-column:1/-1;margin:0">Combined total</p>
        <span>Total commission earned</span>
        <b class="x-big"><CountUp :value="both.earned" /></b>
        <small class="x-muted" style="justify-self:end">Pending {{ pesoC(both.pendingCommission) }}</small>
        <small class="x-muted" style="grid-column:1/-1">Only deals marked Paid count as earned.</small>
      </div>
    </template>

    <div v-else class="ws-card">
      <p class="ws-card-eyebrow">Commission summary</p>
      <h3 class="ws-card-title" style="font-size:20px">What each agent has earned</h3>
      <p class="ws-card-sub">Commission is 10% on sales and 10% on rent, counting paid payments only. Pending payments are not counted yet.</p>
      <div class="seg" role="group" aria-label="Filter by type" style="margin-bottom:14px">
        <button v-for="f in ['All', 'Sale', 'Rent']" :key="f" type="button" :aria-pressed="filter === f" @click="filter = f as any">{{ f }}</button>
      </div>
      <TransitionGroup name="row" tag="div" class="x-rows">
        <div v-for="(r, i) in perAgent" :key="r.a" v-reveal="i" class="x-row" style="padding:18px 8px">
          <div class="x-row-main" style="align-content:center">
            <b>{{ r.a }}</b>
            <p class="x-muted">{{ r.n }} payment{{ r.n === 1 ? '' : 's' }} · Pending {{ pesoC(r.all.pendingAmount) }}</p>
          </div>
          <div class="x-row-side" style="gap:4px">
            <span class="x-comm" style="font-size:15px">Total {{ pesoC(r.all.earned) }}</span>
            <span class="x-muted">Sale commission {{ pesoC(r.sale.earned) }}</span>
            <span class="x-muted">Rent commission {{ pesoC(r.rent.earned) }}</span>
            <span class="x-muted">on {{ pesoC(r.all.paidAmount) }} paid</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
