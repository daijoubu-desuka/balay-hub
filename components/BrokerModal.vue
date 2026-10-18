<script setup lang="ts">
const ui = useUiStore()
watch(() => ui.brokerOpen, v => { if (import.meta.client) document.body.style.overflow = v ? 'hidden' : '' })
onMounted(() => document.addEventListener('keydown', e => { if (e.key === 'Escape') ui.brokerOpen = false }))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.brokerOpen" class="drawer-mask" style="display:grid;place-items:center;padding:16px;z-index:200" @click.self="ui.brokerOpen = false">
        <div class="panel" style="width:min(520px,100%);max-height:92vh;overflow:auto" role="dialog" aria-modal="true" aria-labelledby="broker-title">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px">
            <div>
              <p class="eyebrow">Personalized property match</p>
              <h2 id="broker-title" style="font-size:22px;margin-top:6px">Connect with a Broker</h2>
              <p style="color:var(--muted);margin-top:6px">Tell us what you are looking for in Butuan. Your request is saved in this browser only.</p>
            </div>
            <button class="icon-btn" aria-label="Close" @click="ui.brokerOpen = false"><Icon name="close" /></button>
          </div>
          <InquiryForm property-id="general" title="General broker request" @sent="ui.brokerOpen = false" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
