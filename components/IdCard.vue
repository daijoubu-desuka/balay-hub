<script setup lang="ts">
// Shows the uploaded ID/license image; for seeded demo users (no upload) draws a sample card instead.
const p = defineProps<{ src?: string; face?: string; name: string; kind: 'id' | 'prc'; label: string; number: string }>()
const bad = ref(false)
</script>

<template>
  <figure class="x-idcard">
    <img v-if="src && !bad" :src="src" :alt="`${label} submitted by ${name}`" @error="bad = true" />
    <div v-else class="x-idmock" :class="kind" role="img" :aria-label="`Sample ${label} for ${name} (demo)`">
      <div class="x-idmock-top">{{ kind === 'prc' ? 'Professional Regulation Commission' : 'Republic of the Philippines' }}<small>{{ label }}</small></div>
      <div class="x-idmock-body">
        <img v-if="face" :src="face" alt="" />
        <div><small>Name</small><b>{{ name }}</b><small>{{ kind === 'prc' ? 'License no.' : 'ID no.' }}</small><b>{{ number }}</b></div>
      </div>
    </div>
    <figcaption>{{ label }}<template v-if="!src"> · demo sample</template></figcaption>
  </figure>
</template>
