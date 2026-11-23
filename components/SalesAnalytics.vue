<script setup lang="ts">
// Paid SALES only (rent is excluded here, but counted in the commission views).
const props = defineProps<{ scope: 'admin' | 'agent' }>()
const pay = usePaymentStore()
const auth = useAuthStore()

const agentFilter = ref('all')
const mode = ref<'week' | 'month'>('week')
const asTable = ref(false)
const hover = ref(-1)
const agents = computed(() => [...new Set(pay.items.map(p => p.agent))])
const sales = computed(() => pay.items.filter(p =>
  p.type === 'Sale' && p.status === 'Paid' &&
  (props.scope === 'agent' ? p.agent === auth.user?.name : agentFilter.value === 'all' || p.agent === agentFilter.value)))

const total = computed(() => sales.value.reduce((n, p) => n + p.amount, 0))
const kpis = computed(() => [
  { l: 'Total sales', v: total.value, s: 'Payments marked Paid', i: 'cash' },
  { l: 'Commission earned', v: commissionOf(total.value), s: '10% of paid sales', i: 'building', o: true },
  { l: 'Closed deals', v: sales.value.length, s: 'Paid sales', i: 'check', n: true },
  { l: 'Average sale', v: sales.value.length ? total.value / sales.value.length : 0, s: 'Per closed deal', i: 'area' }
])

const buckets = computed(() => salesBuckets(sales.value, mode.value))

// chart geometry
const W = 640, H = 280, L = 52, B = 36, T = 26
const step = computed(() => { const mx = Math.max(...buckets.value.map(b => b.value), 1e6) / 1e6; return mx <= 5 ? 1 : mx <= 10 ? 2 : mx <= 25 ? 5 : 10 })
const yMax = computed(() => Math.ceil(Math.max(...buckets.value.map(b => b.value), 1e6) / 1e6 / step.value) * step.value)
const ticks = computed(() => { const t = []; for (let v = 0; v <= yMax.value; v += step.value) t.push(v); return t })
const y = (m: number) => T + (H - T - B) * (1 - m / yMax.value)
const bw = computed(() => (W - L) / buckets.value.length)
const lab = (v: number) => (v === 0 ? '₱0' : `₱${+(v / 1e6).toFixed(1)}M`)
const periodName = computed(() => (mode.value === 'week' ? 'Last 8 weeks' : 'Last 6 months'))
</script>

<template>
  <div class="ws-panel-fade">
    <div v-if="scope === 'admin'" style="margin-bottom:14px">
      <label for="an-agent" class="x-muted" style="font-weight:600;font-size:13px;margin-right:8px">Agent</label>
      <select id="an-agent" v-model="agentFilter" class="input" style="width:auto;display:inline-block;height:38px">
        <option value="all">All agents</option><option v-for="a in agents" :key="a" :value="a">{{ a }}</option>
      </select>
    </div>
    <div class="ws-stats">
      <div v-for="(k, i) in kpis" :key="k.l" v-reveal="i" class="ws-stat">
        <div class="ws-stat-top"><span class="ws-stat-label">{{ k.l }}</span><span class="ws-stat-icon"><Icon :name="k.i" /></span></div>
        <div class="ws-stat-val" :class="{ 'x-orange': k.o }"><CountUp :value="k.v" :fmt="k.n ? String : peso" /></div>
        <div class="ws-stat-sub">{{ k.s }}</div>
      </div>
    </div>

    <div class="ws-card">
      <div class="ws-card-header">
        <div><p class="ws-card-eyebrow">Sales over time</p><h3 class="ws-card-title">{{ periodName }}</h3>
          <p class="ws-card-sub" style="margin-bottom:0">Paid sales per {{ mode }}, weeks start on Monday. The current period is orange.</p></div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <div class="seg" role="group" aria-label="Period">
            <button type="button" :aria-pressed="mode === 'week'" @click="mode = 'week'">Weekly</button>
            <button type="button" :aria-pressed="mode === 'month'" @click="mode = 'month'">Monthly</button>
          </div>
          <label class="x-switch"><input v-model="asTable" type="checkbox" role="switch" /> View as table</label>
        </div>
      </div>

      <Transition name="swap" mode="out-in">
        <div v-if="asTable" :key="'t' + mode">
          <table class="x-table">
            <caption class="sr-only">Paid sales per {{ mode }}</caption>
            <thead><tr><th scope="col">{{ mode === 'week' ? 'Week starting' : 'Month' }}</th><th scope="col">Paid sales</th></tr></thead>
            <tbody><tr v-for="b in buckets" :key="b.label"><th scope="row">{{ b.label }}</th><td>{{ pesoC(b.value) }}</td></tr></tbody>
          </table>
        </div>
        <div v-else :key="'c' + mode" class="x-chart">
          <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`Bar chart of paid sales, ${periodName}`">
            <g v-for="t in ticks" :key="t">
              <line :x1="L" :x2="W" :y1="y(t)" :y2="y(t)" stroke="var(--line)" />
              <text :x="L - 8" :y="y(t) + 4" text-anchor="end" class="x-ax">{{ t }}</text>
            </g>
            <text x="4" :y="T - 10" class="x-ax">PHP M</text>
            <g v-for="(b, i) in buckets" :key="b.label">
              <rect
                class="x-bar" :class="{ now: i === buckets.length - 1 }" tabindex="0"
                :x="L + i * bw + bw * 0.18" :width="bw * 0.64" :y="y(b.value / 1e6)" :height="Math.max(H - B - y(b.value / 1e6), 0)" rx="6"
                :style="{ animationDelay: i * 40 + 'ms' }" :aria-label="`${b.label}: ${pesoC(b.value)}`"
                @mouseenter="hover = i" @mouseleave="hover = -1" @focus="hover = i" @blur="hover = -1" />
              <text class="x-val" :x="L + i * bw + bw / 2" :y="y(b.value / 1e6) - 6" text-anchor="middle" :style="{ animationDelay: 400 + i * 40 + 'ms' }">{{ lab(b.value) }}</text>
              <text class="x-ax" :x="L + i * bw + bw / 2" :y="H - 12" text-anchor="middle">{{ b.label }}</text>
            </g>
          </svg>
          <div v-if="hover >= 0" class="x-tip" role="status">{{ buckets[hover].label }}: <b>{{ pesoC(buckets[hover].value) }}</b></div>
        </div>
      </Transition>
    </div>
  </div>
</template>
