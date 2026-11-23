<script setup lang="ts">
import type { Person, Thread } from '~/stores/messages'

const auth = useAuthStore()
const msgs = useMessageStore()
const creds = useCredentialStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()
const { simulateReply } = useLiveFeed()
const face = useFace()

const me = computed<Person | null>(() => (auth.user ? { id: auth.user.id, name: auth.user.name, role: auth.user.role } : null))
const q = ref('')
const activeId = ref('')
const conv = ref(false) // mobile: show the conversation pane
const draft = ref('')
const err = ref('')
const composer = ref<HTMLTextAreaElement | null>(null)
const log = ref<HTMLElement | null>(null)
const target = ref('')

const other = (t: Thread) => { const p = t.a.id === me.value?.id ? t.b : t.a; return { ...p, name: nameOf(p.id, p.name) } }
const threads = computed(() => msgs.mine(me.value).filter(t => {
  const s = q.value.trim().toLowerCase()
  return !s || `${other(t).name} ${t.topic} ${t.propertyTitle}`.toLowerCase().includes(s)
}))
const active = computed(() => msgs.threads.find(t => t.id === activeId.value && me.value && [t.a.id, t.b.id].includes(me.value.id)))
const people = computed<Person[]>(() => me.value
  ? auth.users.map(u => ({ id: u.id, name: u.name, role: u.role })).filter(p => canMessage(me.value!, p))
  : [])
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
const day = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' })
const last = (t: Thread) => t.messages.at(-1)
const quick = ['Tomorrow 3 PM works', 'Please send your preferred date', 'The unit is still available']

// messages with day separators
const items = computed(() => {
  const out: ({ sep: string; id: string } | (Thread['messages'][number] & { sep?: undefined }))[] = []
  let d = ''
  for (const m of active.value?.messages ?? []) {
    const k = day(m.at)
    if (k !== d) { d = k; out.push({ sep: k, id: 'd-' + k }) }
    out.push(m)
  }
  return out
})

async function open(id: string) {
  activeId.value = id
  if (route.query.t !== id) router.replace({ query: { ...route.query, t: id } })
  conv.value = true
  if (me.value) msgs.markRead(id, me.value.id)
  await nextTick()
  composer.value?.focus() // focus moves to the composer
  scroll()
}
function scroll() { nextTick(() => { if (log.value) log.value.scrollTop = log.value.scrollHeight }) }
function start() {
  const p = people.value.find(x => x.id === target.value)
  if (!p || !me.value) return
  open(msgs.open(me.value, p))
  target.value = ''
}
function send(text = draft.value) {
  err.value = ''
  const t = text.trim()
  if (!t) err.value = 'Write a message first.'
  else if (t.length > MAX_MSG) err.value = `Keep it under ${MAX_MSG} characters.`
  if (err.value) { ui.toast(err.value, 'error'); return }
  if (!me.value || !active.value) return
  msgs.send(active.value.id, me.value, t)
  simulateReply(active.value.id, me.value)
  draft.value = ''
  scroll()
}
function onKey(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

// keep the open thread read and scrolled when something new arrives (also from another tab)
watch(() => active.value?.messages.length, () => { if (active.value && me.value) msgs.markRead(active.value.id, me.value.id); scroll() })
onMounted(() => { const t = String(route.query.t || ''); if (t) open(t) })
// a notification link to another thread while this panel is already open
watch(() => route.query.t, t => { if (t && t !== activeId.value) open(String(t)) })
</script>

<template>
  <div class="ws-panel-fade">
    <div class="x-msgs" :class="{ conv }">
      <div class="x-list">
        <div class="x-list-head">
          <label class="sr-only" for="ms-search">Search conversations</label>
          <input id="ms-search" v-model="q" class="input" type="search" placeholder="Search conversations" style="height:40px" />
          <div class="x-new">
            <label class="sr-only" for="ms-new">Start a new conversation</label>
            <select id="ms-new" v-model="target" class="input" style="height:38px"><option value="">New message to…</option><option v-for="p in people" :key="p.id" :value="p.id">{{ p.name }} ({{ p.role }})</option></select>
            <button class="btn btn-navy btn-sm" :disabled="!target" @click="start">Start</button>
          </div>
        </div>
        <TransitionGroup name="row" tag="div" class="x-threads">
          <button v-for="t in threads" :key="t.id" class="x-thread" :class="{ active: t.id === activeId }" @click="open(t.id)">
            <span class="ws-thread-avatar" aria-hidden="true"><img v-if="face(other(t).id)" :src="face(other(t).id)" alt="" class="x-ava-img" /><template v-else>{{ initials(other(t).name) }}</template></span>
            <span class="x-thread-body">
              <span class="x-thread-top"><b>{{ other(t).name }}</b><small>{{ last(t) ? time(last(t)!.at) : '' }}</small></span>
              <span class="x-chips">
                <span class="x-role" :class="other(t).role">{{ other(t).role }}</span>
                <VerifiedBadge v-if="other(t).role === 'agent' && creds.isVerified(other(t).id)" />
              </span>
              <small class="x-muted">{{ t.propertyTitle || t.topic }}</small>
              <span class="ws-thread-snippet">{{ last(t)?.text ?? 'No messages yet' }}</span>
            </span>
            <span v-if="msgs.unreadIn(t, me!.id)" :key="msgs.unreadIn(t, me!.id)" class="x-unread" :aria-label="`${msgs.unreadIn(t, me!.id)} unread`">{{ msgs.unreadIn(t, me!.id) }}</span>
          </button>
        </TransitionGroup>
        <p v-if="!threads.length" class="x-empty">No conversations found.</p>
      </div>

      <div class="x-conv">
        <template v-if="active">
          <div class="x-conv-head">
            <button class="btn btn-ghost btn-sm x-back" @click="conv = false">← Back</button>
            <div><b>{{ other(active).name }}</b> <span class="x-role" :class="other(active).role">{{ other(active).role }}</span>
              <p class="x-muted" style="font-size:12px">{{ active.topic }}</p></div>
          </div>
          <NuxtLink v-if="active.propertyId" :to="`/property/${active.propertyId}`" class="x-propchip"><Icon name="home" /> {{ active.propertyTitle }} <span>View listing →</span></NuxtLink>
          <div ref="log" class="x-log" role="log" aria-live="polite" aria-label="Conversation">
            <TransitionGroup name="bubble">
              <template v-for="m in items" :key="m.id">
                <p v-if="m.sep" :key="m.id" class="x-day">{{ m.sep }}</p>
                <div v-else :key="m.id" class="x-bubble" :class="m.from === me!.id ? 'mine' : 'theirs'">
                  <p>{{ m.text }}</p>
                  <small>{{ time(m.at) }}<template v-if="m.from === me!.id"> · <span aria-hidden="true">{{ m.read ? '✓✓' : '✓' }}</span><span class="sr-only">{{ m.read ? 'Read' : 'Sent' }}</span></template></small>
                </div>
              </template>
            </TransitionGroup>
            <div v-if="msgs.typing[active.id]" class="x-typing" role="status" aria-label="Typing"><i /><i /><i /></div>
            <p v-if="!active.messages.length" class="x-empty">Say hello to {{ other(active).name }}.</p>
          </div>
          <div v-if="me!.role === 'agent'" class="x-quick" role="group" aria-label="Quick replies">
            <button v-for="r in quick" :key="r" type="button" class="pill" @click="send(r)">{{ r }}</button>
          </div>
          <form class="x-composer" novalidate @submit.prevent="send()">
            <label class="sr-only" for="ms-text">Message</label>
            <textarea id="ms-text" ref="composer" v-model="draft" class="input" rows="2" placeholder="Write a message… (Enter to send, Shift+Enter for a new line)" :aria-invalid="!!err || draft.length > MAX_MSG" @keydown="onKey" />
            <div class="x-composer-foot">
              <span :class="{ over: draft.length > MAX_MSG }" aria-live="off">{{ draft.length }}/{{ MAX_MSG }}</span>
              <button type="submit" class="btn btn-navy btn-sm">Send ↗</button>
            </div>
            <p v-if="err" class="err" role="alert">{{ err }}</p>
          </form>
        </template>
        <div v-else class="x-empty" style="margin:auto">Select a conversation to start.</div>
      </div>
    </div>
    <p class="x-muted" style="font-size:12px;margin-top:10px">Messages stay in this browser. This demo has no email or phone connection.</p>
  </div>
</template>
