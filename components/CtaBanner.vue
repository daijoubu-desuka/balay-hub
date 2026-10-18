<script setup lang="ts">
const ui = useUiStore()
</script>

<template>
  <section class="cta" aria-labelledby="cta-h">
    <div class="ico"><Icon name="broker" /></div>
    <div>
      <p class="eyebrow">Personalized property match</p>
      <h2 id="cta-h">Can’t find your exact dream property?</h2>
      <p>Tell us what you’re looking for and explore Butuan property listings or request a viewing. Every action stays in this browser; no advisor or service is contacted.</p>
    </div>
    <div class="cta-actions">
      <button class="btn btn-orange btn-lg" @click="ui.brokerOpen = true"><Icon name="calendar" /> Connect with a Broker</button>
      <button class="btn btn-glass btn-lg" @click="ui.toast('Buyer FAQ will be added in the final phase.')">View Buyer FAQ</button>
    </div>
  </section>
</template>
