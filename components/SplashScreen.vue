<script setup lang="ts">
const ui = useUiStore()
const visible = ref(true)

onMounted(() => {
  let seen = false
  try { seen = sessionStorage.getItem('bahayhub_splash') === '1' } catch { /* ignore */ }
  const wait = seen ? 0 : 1900
  setTimeout(() => {
    visible.value = false
    ui.splashDone = true
    try { sessionStorage.setItem('bahayhub_splash', '1') } catch { /* ignore */ }
  }, wait)
})
</script>

<template>
  <Transition name="splash-fade">
    <div v-if="visible" class="splash" role="status" aria-live="polite" aria-label="Loading BahayHub">
      <div class="splash-inner">
        <div class="logo-float"><Logo :size="64" light stacked /></div>
        <div class="splash-bar"><i /></div>
        <p class="splash-text">Butuan City · Loading</p>
      </div>
    </div>
  </Transition>
</template>
