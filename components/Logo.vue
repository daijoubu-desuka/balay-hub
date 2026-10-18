<script setup lang="ts">
defineProps<{ size?: number; light?: boolean; stacked?: boolean }>()
</script>

<template>
  <span class="logo" :style="{ display: 'inline-flex', alignItems: 'center', gap: ((size || 32) * .3) + 'px', flexDirection: stacked ? 'column' : 'row' }">
    <svg :width="(size || 32) * 1.15" :height="size || 32" viewBox="0 0 40 36" aria-hidden="true">
      <path d="M20 2 3 17h6v16h22V17h6z" :fill="light ? '#ffffff' : '#0b2a4a'" opacity=".95" />
      <path d="M20 2 3 17h6L20 8l11 9h6z" fill="#e8601c" />
      <path d="M15 33V22h10v11z" :fill="light ? '#0b2a4a' : '#ffffff'" />
      <path d="M20 12 12 19h16z" fill="#f59e0b" opacity=".0" />
    </svg>
    <span :style="{ display: 'flex', flexDirection: 'column', lineHeight: 1, alignItems: stacked ? 'center' : 'flex-start' }">
      <span :style="{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: ((size || 32) * .62) + 'px', letterSpacing: '-.02em', color: light ? '#fff' : '#0b2a4a' }">Bahay<span style="color:#e8601c">Hub</span></span>
      <span :style="{ fontSize: Math.max(7, (size || 32) * .22) + 'px', letterSpacing: '.2em', fontWeight: 700, color: light ? '#c9d6e6' : '#6b7a8d', marginTop: '3px' }">REAL ESTATE PH</span>
    </span>
  </span>
</template>
