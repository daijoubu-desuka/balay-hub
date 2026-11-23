<script setup lang="ts">
interface Tab { id: string; label: string; badge?: number | string }

const props = defineProps<{ tabs: Tab[]; modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', id: string): void }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const current = computed(() => props.tabs.find(t => t.id === props.modelValue) ?? props.tabs[0])

function pick(id: string) {
  emit('update:modelValue', id)
  open.value = false
}
function onDoc(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') open.value = false }

onMounted(() => {
  document.addEventListener('click', onDoc)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDoc)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="wts">
    <button type="button" class="wts-btn" :class="{ open }" aria-haspopup="listbox" :aria-expanded="open" @click="open = !open">
      <span class="wts-label">{{ current?.label }}</span>
      <span v-if="current?.badge" class="wts-badge">{{ current.badge }}</span>
      <svg class="wts-chev" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1.5l5 5 5-5" /></svg>
    </button>
    <Transition name="wts-pop">
      <ul v-if="open" class="wts-list" role="listbox">
        <li v-for="t in tabs" :key="t.id" role="option" :aria-selected="t.id === modelValue">
          <button type="button" class="wts-item" :class="{ active: t.id === modelValue }" @click="pick(t.id)">
            <span>{{ t.label }}</span>
            <span v-if="t.badge" class="wts-badge">{{ t.badge }}</span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.wts { display: none; position: relative; margin: 10px 0; }
@media (max-width: 680px) { .wts { display: block; } }
.wts-btn { position: relative; width: 100%; height: 48px; padding: 0 44px; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--navy); color: #fff; border: 0; border-radius: 50px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 12px rgba(11, 42, 74, .2); cursor: pointer; }
.wts-label { text-align: center; line-height: 1.2; }
.wts-chev { position: absolute; right: 18px; top: 50%; margin-top: -4px; transition: transform .2s; }
.wts-btn.open .wts-chev { transform: rotate(180deg); }
.wts-badge { background: var(--orange); color: #fff; font-size: 10px; font-weight: 700; border-radius: 50px; min-width: 18px; height: 18px; padding: 0 5px; display: inline-grid; place-items: center; }
.wts-btn .wts-badge { background: #fff; color: var(--navy); }
.wts-list { position: absolute; z-index: 50; top: calc(100% + 8px); left: 0; right: 0; list-style: none; margin: 0; padding: 6px; background: #fff; border: 1px solid var(--line); border-radius: 18px; box-shadow: 0 16px 40px rgba(11, 42, 74, .18); max-height: 60vh; overflow-y: auto; }
.wts-item { width: 100%; min-height: 44px; padding: 8px 16px; display: flex; align-items: center; justify-content: center; gap: 8px; background: transparent; border: 0; border-radius: 50px; font-size: 14.5px; font-weight: 600; color: var(--ink); text-align: center; cursor: pointer; }
.wts-item:active { background: var(--bg); }
.wts-item.active { background: var(--chip); color: var(--navy); font-weight: 800; }
.wts-pop-enter-active, .wts-pop-leave-active { transition: opacity .15s, transform .15s; }
.wts-pop-enter-from, .wts-pop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
