<script setup lang="ts">
useHead({ title: 'Homes for rent in Butuan | BahayHub Butuan' })
</script>

<template>
  <div>
    <PageHero
      crumb="For rent" title="Homes for rent in Butuan"
      img="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=80"
      text="Furnished homes, condominium units and loft apartments for rent across Butuan City. Monthly rates are shown in Philippine pesos."
    />
    <div class="pb-overlap">
      <PropertyBrowser :preset="{ mode: 'rent' }" :hide-toggle="true" />
    </div>
  </div>
</template>
