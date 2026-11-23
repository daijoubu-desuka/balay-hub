<script setup lang="ts">
defineProps<{ title: string; text: string; crumb: string; img?: string }>()
const hide = (e: Event) => ((e.target as HTMLImageElement).style.visibility = 'hidden')
</script>

<template>
  <section class="ph-hero ph-hero-sm">
    <img v-if="img" :src="img" alt="" fetchpriority="high" @error="hide" />
    <div class="wrap ph-hero-in">
      <nav class="ph-crumb" aria-label="Breadcrumb"><NuxtLink to="/">Home</NuxtLink><span>/</span><NuxtLink to="/browse">Browse</NuxtLink><span>/</span><span>{{ crumb }}</span></nav>
      <p class="ph-eyebrow">Butuan City · Property listings</p>
      <h1>{{ title }}</h1>
      <p>{{ text }}</p>
    </div>
  </section>
</template>
