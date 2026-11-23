<script setup lang="ts">
// Slide-in side panel: tap a row/chip to see its context. Content goes in the default slot.
const props = defineProps<{ open: boolean; title: string; eyebrow?: string }>()
const emit = defineEmits<{ close: [] }>()
const closeBtn = ref<HTMLButtonElement>()
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
watch(() => props.open, async o => {
  if (!import.meta.client) return
  document.body.style.overflow = o ? 'hidden' : ''
  if (o) { window.addEventListener('keydown', onKey); await nextTick(); closeBtn.value?.focus() } else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => { if (import.meta.client) { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) } })
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="x-drawer-mask" @click.self="emit('close')">
        <aside class="x-drawer" role="dialog" aria-modal="true" :aria-label="title">
          <header class="x-drawer-head">
            <div>
              <p v-if="eyebrow" class="ws-card-eyebrow">{{ eyebrow }}</p>
              <h3 class="ws-card-title">{{ title }}</h3>
            </div>
            <button ref="closeBtn" class="btn btn-ghost btn-sm" aria-label="Close details" @click="emit('close')">✕</button>
          </header>
          <div class="x-drawer-body"><slot /></div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
