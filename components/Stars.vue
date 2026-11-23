<script setup lang="ts">
// Star rating with the number next to it, so it is never shown by colour alone.
const p = defineProps<{ value: number; count?: number; small?: boolean }>()
const pct = computed(() => (Math.max(0, Math.min(5, p.value)) / 5) * 100)
</script>

<template>
  <span class="x-stars" :class="{ small }" :aria-label="value ? `Rated ${value} out of 5${count !== undefined ? `, ${count} review${count === 1 ? '' : 's'}` : ''}` : 'No reviews yet'">
    <span class="x-stars-track" aria-hidden="true">★★★★★<span class="x-stars-fill" :style="{ width: pct + '%' }">★★★★★</span></span>
    <b v-if="value" aria-hidden="true">{{ value.toFixed(1) }}</b>
    <small v-if="count !== undefined" aria-hidden="true">({{ count }})</small>
    <small v-if="!value" aria-hidden="true">New</small>
  </span>
</template>
