<script setup lang="ts">
defineProps<{ title: string; text: string; crumb: string }>()
</script>

<template>
  <section class="hero" style="background:linear-gradient(180deg,#f9f8ff,var(--bg))">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><NuxtLink to="/">Browse properties</NuxtLink><span>/</span><span>{{ crumb }}</span></nav>
      <div class="hero-row">
        <div>
          <p class="eyebrow">Butuan City · Property listings</p>
          <h1>{{ title }}</h1>
          <p>{{ text }}</p>
          <small>Property details and contact information shown here are stored in this browser and have not been independently verified.</small>
        </div>
        <NuxtLink to="/" class="btn btn-ghost">Browse all properties</NuxtLink>
      </div>
    </div>
  </section>
</template>
