<script setup lang="ts">
useHead({ title: 'Homes for rent in Butuan | BahayHub Butuan' })
</script>

<template>
  <div>
    <PageHero crumb="For rent" title="Homes for rent in Butuan" text="Find furnished homes, condominium units and loft apartments for rent across Butuan City. Monthly rates are shown in Philippine pesos." />
    <PropertyBrowser :preset="{ mode: 'rent' }" :hide-toggle="true" />
  </div>
</template>
