<script setup lang="ts">
import type { Toast } from '~/stores/ui'
const ui = useUiStore()
const notify = useNotifyStore()
const router = useRouter()

// notification toasts open the page they are about; plain toasts just close
function tap(t: Toast) {
  ui.dismiss(t.id)
  if (!t.link) return
  if (t.noticeId) notify.read(t.noticeId)
  router.push(t.link)
}
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <component
        :is="t.link ? 'button' : 'div'" v-for="t in ui.toasts" :key="t.id" class="toast" :class="[t.type, { linked: t.link }]" role="status"
        @click="tap(t)" @mouseenter="ui.hold(t.id)" @mouseleave="ui.release(t.id)"
      >
        <Icon :name="t.type === 'error' ? 'alert' : t.link ? 'bell' : 'check'" />
        <span>{{ t.message }}<small v-if="t.link" class="toast-go">Open →</small></span>
      </component>
    </TransitionGroup>
  </div>
</template>
