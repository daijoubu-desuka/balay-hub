<script setup lang="ts">
import type { Payment } from '~/stores/payments'

// Compact 8-week paid-sales chart for the Overview; the full chart lives on the Analytics tab.
const props = defineProps<{ payments: Payment[]; to: string }>()
const b = computed(() => salesBuckets(paidSales(props.payments), 'week'))
const max = computed(() => Math.max(...b.value.map(x => x.value), 1))
const now = computed(() => b.value[b.value.length - 1].value)
const total = computed(() => b.value.reduce((n, x) => n + x.value, 0))
const lastHalf = computed(() => b.value.slice(4).reduce((n, x) => n + x.value, 0))
const firstHalf = computed(() => b.value.slice(0, 4).reduce((n, x) => n + x.value, 0))
const change = computed(() => (firstHalf.value ? Math.round(((lastHalf.value - firstHalf.value) / firstHalf.value) * 100) : null))
const M = (v: number) => (v ? `₱${+(v / 1e6).toFixed(1)}M` : '₱0')
</script>

<template>
  <div class="ws-card x-trend">
    <div class="ws-card-header" style="margin-bottom:8px">
      <div>
        <p class="ws-card-eyebrow">Sales trend</p>
        <h3 class="ws-card-title">Paid sales, last 8 weeks</h3>
      </div>
      <NuxtLink :to="to" class="ws-link-btn">Open analytics →</NuxtLink>
    </div>
    <div class="x-trend-nums">
      <div><small>8-week total</small><b>{{ pesoC(total) }}</b></div>
      <div><small>This week</small><b class="x-orange">{{ pesoC(now) }}</b></div>
      <div v-if="change !== null"><small>Last 4 vs previous 4 weeks</small><b :class="change >= 0 ? 'up' : 'down'">{{ change >= 0 ? '▲' : '▼' }} {{ Math.abs(change) }}%</b></div>
    </div>
    <div class="x-trend-bars" role="img" :aria-label="`Weekly paid sales: ${b.map(x => `${x.label} ${M(x.value)}`).join(', ')}`">
      <div v-for="(x, i) in b" :key="x.label" class="x-trend-col">
        <span class="x-trend-v">{{ x.value ? M(x.value) : '' }}</span>
        <i :class="{ now: i === b.length - 1 }" :style="{ height: Math.max(3, (x.value / max) * 100) + '%', animationDelay: i * 40 + 'ms' }" />
        <small>{{ x.label }}</small>
      </div>
    </div>
  </div>
</template>
