<script setup lang="ts">
const props = defineProps<{ name: string }>()
// Simple stroke icons (24x24). Paths are static strings written for this project.
const paths: Record<string, string> = {
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M3 21h18M8 8h2M8 12h2M8 16h2"/>',
  cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M7 9v.01M17 15v.01"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  heart: '<path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21.8l8.8-8.8a5.2 5.2 0 0 0 0-7.4z"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  bed: '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
  bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 3.5-1.3M7 19l-1 2M17 19l1 2"/>',
  area: '<path d="M4 20V4M4 20h16M8 16l8-8M8 12v4h4M16 12V8h-4"/>',
  car: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18M7 16v2M17 16v2"/><circle cx="8" cy="13" r=".8"/><circle cx="16" cy="13" r=".8"/>',
  pool: '<path d="M3 19c2 0 2-1.5 4.5-1.5S10 19 12 19s2-1.500 4.500-1.500S19 19 21 19M8 14V6a2 2 0 0 1 4 0M14 14V6a2 2 0 0 1 4 0M8 10h6"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.500a10 10 0 0 1 14 0M8.500 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r=".8"/>',
  zone: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  balcony: '<path d="M4 10h16M4 10V4h16v6M6 10v10M10 10v10M14 10v10M18 10v10M3 20h18"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.500 8 8 9 4.500-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  home: '<path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  check: '<path d="m5 12.500 4.500 4.500L19 7.500"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.500"/><rect x="13" y="4" width="7" height="7" rx="1.500"/><rect x="4" y="13" width="7" height="7" rx="1.500"/><rect x="13" y="13" width="7" height="7" rx="1.500"/>',
  list: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  broker: '<path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M9 7h6"/>',
  eye: '<path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.01"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  empty: '<path d="M3 11 12 3l9 8M5 10v10h14V10M9 20v-5h6v5"/><path d="m4 4 16 16"/>'
}
const html = computed(() => paths[props.name] || '')
</script>

<template>
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="html" />
</template>
