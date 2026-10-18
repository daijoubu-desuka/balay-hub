<script setup lang="ts">
useHead({
  title: 'Browse Properties in Butuan | BahayHub',
  meta: [{ name: 'description', content: 'Browse houses, condominiums, lots, and commercial spaces for sale in Butuan City. Filter by price, location, and type.' }]
})
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="bp-hero">
      <div class="wrap bp-hero-in">
        <div class="bp-hero-text">
          <span class="bp-eyebrow">🏠 Butuan City, Agusan del Norte</span>
          <h1>Find your home in Butuan City.</h1>
          <p>Browse houses, condominiums, lots, and commercial properties for sale across Butuan's most sought-after neighborhoods. All listings are Butuan-local.</p>
        </div>
        <div class="bp-hero-stats">
          <div class="bp-stat"><strong>50+</strong><span>Active Listings</span></div>
          <div class="bp-stat"><strong>11</strong><span>Neighborhoods</span></div>
          <div class="bp-stat"><strong>₱1M</strong><span>Starting Price</span></div>
          <div class="bp-stat"><strong>5</strong><span>Property Types</span></div>
        </div>
      </div>
    </section>

    <PropertyBrowser :preset="{ mode: 'sale' }" :hide-toggle="true" />
  </div>
</template>

<style scoped>
.bp-hero {
  background: linear-gradient(135deg, #0b2a4a 0%, #1a4a7a 55%, #0d3a6e 100%);
  padding: 56px 0 48px;
  color: #fff;
}
.bp-hero-in {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 40px;
  justify-content: space-between;
}
.bp-hero-text { flex: 1 1 340px; }
.bp-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #f59e4a;
  display: block;
  margin-bottom: 10px;
}
.bp-hero-text h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 14px;
  color: #fff;
}
.bp-hero-text p {
  font-size: 1rem;
  color: rgba(255,255,255,.8);
  line-height: 1.7;
  max-width: 460px;
}
.bp-hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.bp-stat {
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.15);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 16px 24px;
  text-align: center;
  min-width: 100px;
}
.bp-stat strong {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #f59e4a;
  line-height: 1;
  margin-bottom: 4px;
}
.bp-stat span {
  font-size: 11px;
  color: rgba(255,255,255,.7);
  font-weight: 500;
}
</style>
