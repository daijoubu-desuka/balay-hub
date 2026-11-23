<script setup lang="ts">
// Latest notifications for the signed-in user, each one linking to where it can be checked.
const auth = useAuthStore()
const notify = useNotifyStore()
const router = useRouter()
const list = computed(() => notify.forUser(auth.user).slice(0, 6))
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`
}
const icon: Record<string, string> = { payment: 'cash', prc: 'shield', message: 'chat', profile: 'user', request: 'list', listing: 'home' }
function go(n: (typeof list.value)[number]) { notify.read(n.id); router.push(n.link) }
</script>

<template>
  <div class="ws-card">
    <p class="ws-card-eyebrow">Latest updates</p>
    <h3 class="ws-card-title" style="margin-bottom:10px">What changed recently</h3>
    <ul v-if="list.length" class="x-feed">
      <li v-for="n in list" :key="n.id">
        <button :class="{ unread: !n.read }" @click="go(n)">
          <span class="x-feed-ico"><Icon :name="icon[n.type] || 'bell'" /></span>
          <span><b>{{ n.title }}</b><small>{{ n.body }}</small></span>
          <small class="x-muted">{{ ago(n.createdAt) }}</small>
        </button>
      </li>
    </ul>
    <p v-else class="x-empty" style="padding:16px 0">No updates yet. New payments, reviews and messages will appear here.</p>
  </div>
</template>
