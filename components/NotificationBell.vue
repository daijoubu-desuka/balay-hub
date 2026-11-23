<script setup lang="ts">
const auth = useAuthStore()
const notify = useNotifyStore()
const router = useRouter()
const { live, setLive } = useLiveFeed()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const swing = ref(false)
const list = computed(() => notify.forUser(auth.user).slice(0, 20))
const unread = computed(() => list.value.filter(n => !n.read).length)
const newest = computed(() => list.value[0])
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`
}

function go(n: (typeof list.value)[number]) { notify.read(n.id); open.value = false; router.push(n.link) }
function onDoc(e: MouseEvent) { if (root.value && !root.value.contains(e.target as Node)) open.value = false }
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') open.value = false }
watch(unread, (n, o) => { if (n > o) { swing.value = true; setTimeout(() => (swing.value = false), 700) } })
onMounted(() => { document.addEventListener('click', onDoc); document.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey) })
</script>

<template>
  <div ref="root" class="x-bell-wrap">
    <button class="icon-btn" :class="{ swing }" :aria-expanded="open" aria-haspopup="dialog" :aria-label="`Notifications, ${unread} unread`" @click.stop="open = !open">
      <Icon name="bell" />
      <span v-if="unread" :key="unread" class="badge-dot x-pop">{{ unread }}</span>
    </button>
    <span class="sr-only" aria-live="polite">{{ newest && !newest.read ? `New notification: ${newest.title}` : '' }}</span>
    <Transition name="pop">
      <div v-if="open" class="x-panel" role="dialog" aria-label="Notifications">
        <div class="x-panel-head">
          <b>Notifications</b>
          <button class="ws-link-btn" :disabled="!unread" @click="notify.readAll(auth.user!)">Mark all read</button>
        </div>
        <ul v-if="list.length" class="x-notes">
          <li v-for="n in list" :key="n.id">
            <button :class="{ unread: !n.read }" @click="go(n)">
              <span class="x-dot" aria-hidden="true" />
              <span><b>{{ n.title }}</b><span class="sr-only">{{ n.read ? '' : ' (unread)' }}</span><small>{{ n.body }}</small><small class="x-muted">{{ ago(n.createdAt) }}</small></span>
            </button>
          </li>
        </ul>
        <p v-else class="x-empty">You are all caught up.</p>
        <label class="x-switch x-panel-foot"><input type="checkbox" role="switch" :checked="live" @change="setLive(($event.target as HTMLInputElement).checked)" /> Live demo mode <small class="x-muted">(sample events every 20 to 40 s)</small></label>
      </div>
    </Transition>
  </div>
</template>
