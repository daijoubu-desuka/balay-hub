<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'My account | BahayHub Butuan' })

const auth = useAuthStore()
const store = usePropertyStore()
const ui = useUiStore()
const messageAgent = useMessageAgent()
const face = useFace()
const router = useRouter()
await useAsyncData('properties', async () => { await store.load(); return true })

const notes: Record<string, string> = {
  client: 'Save homes, send viewing requests, and track your inquiries from here.',
  agent: 'Manage your listings and respond to client inquiries from your workspace.',
  admin: 'Oversee agents, listings, and client requests from your admin workspace.'
}

watch(() => auth.user, u => {
  if (u?.role === 'agent') router.replace('/agent')
  else if (u?.role === 'admin') router.replace('/admin')
}, { immediate: true })

const fmt = (s: string) => new Date(s).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
function out() { auth.logout(); ui.toast('You have been logged out.', 'success'); navigateTo('/login') }
</script>

<template>
  <div v-if="auth.user" class="wrap">
    <section class="acct-hero">
      <p class="ph-eyebrow">My account · Butuan City</p>
      <h1>Hello, {{ auth.user.name.split(' ')[0] }}.</h1>
      <p>Your saved homes, viewing requests and identity check, all in one place.</p>
    </section>
    <div class="acct-grid">
      <aside class="panel profile">
        <span class="avatar" aria-hidden="true"><img v-if="face(auth.user.id)" :src="face(auth.user.id)" alt="" class="x-ava-img" /><template v-else>{{ auth.initials }}</template></span>
        <h3>{{ auth.user.name }}</h3>
        <span class="role-tag">{{ auth.user.role }} account</span>
        <p style="color:var(--muted)">{{ auth.user.email }}</p>
        <p style="color:var(--muted);font-size:13px">{{ notes[auth.user.role] }}</p>
        <button class="btn btn-ghost" style="width:100%" @click="out"><Icon name="logout" /> Log out</button>
      </aside>
      <div style="display:grid;gap:20px;min-width:0">
        <SituationNotice />
        <ProfileEditor />
        <BuyerIdStatus />
        <section id="saved" class="panel" style="scroll-margin-top:90px">
          <h2 style="font-size:20px;margin-bottom:14px">Saved homes ({{ store.savedItems.length }})</h2>
          <div v-if="store.savedItems.length" class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
            <PropertyCard v-for="p in store.savedItems" :key="p.id" :item="p" />
          </div>
          <div v-else class="empty" style="box-shadow:none;background:var(--bg)">
            <Icon name="heart" /><p>You have no saved homes yet.</p>
            <NuxtLink to="/browse" class="btn btn-navy">Browse properties</NuxtLink>
          </div>
        </section>
        <section id="inquiries" class="panel" style="scroll-margin-top:90px">
          <h2 style="font-size:20px;margin-bottom:14px">Viewing requests ({{ store.inquiries.length }})</h2>
          <div v-if="store.inquiries.length">
            <div v-for="i in store.inquiries" :key="i.id" class="inq">
              <div>
                <b>{{ i.title }}</b>
                <p style="color:var(--muted);font-size:13px">Preferred date: {{ fmt(i.date) }} · {{ i.phone }}</p>
                <p v-if="i.message" style="margin-top:4px">{{ i.message }}</p>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <button v-if="i.propertyId !== 'general'" class="btn btn-ghost btn-sm" @click="messageAgent({ id: i.propertyId, title: i.title })"><Icon name="mail" /> Message agent</button>
                <button class="icon-btn" :aria-label="`Delete request for ${i.title}`" @click="store.removeInquiry(i.id)"><Icon name="trash" /></button>
              </div>
            </div>
          </div>
          <p v-else style="color:var(--muted)">No viewing requests yet. Open a property and tap “Request a viewing”.</p>
        </section>
      </div>
    </div>
  </div>
</template>
