<script setup lang="ts">
// KPI number that counts up over 600 ms on first view and when the value changes
const p = defineProps<{ value: number; fmt?: (n: number) => string }>()
const shown = ref(p.value)
let raf = 0

function run(from: number, to: number) {
  cancelAnimationFrame(raf)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { shown.value = to; return }
  const t0 = performance.now()
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / 600)
    shown.value = from + (to - from) * (1 - Math.pow(1 - k, 3))
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}
onMounted(() => run(0, p.value))
watch(() => p.value, (to, from) => run(from, to))
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <span>{{ fmt ? fmt(Math.round(shown)) : pesoC(Math.round(shown * 100) / 100) }}</span>
</template>
