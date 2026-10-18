<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'My account | BahayHub Butuan' })

const auth = useAuthStore()
const store = usePropertyStore()
const ui = useUiStore()
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
    <section class="hero" style="padding-bottom:10px">
      <p class="eyebrow">{{ auth.user.role }} workspace</p>
      <h1 style="font-size:clamp(28px,4vw,40px);margin-top:8px">Hello, {{ auth.user.name.split(' ')[0] }}.</h1>
    </section>
    <div class="acct-grid">
      <aside class="panel profile">
        <span class="avatar" aria-hidden="true">{{ auth.initials }}</span>
        <h3>{{ auth.user.name }}</h3>
        <span class="role-tag">{{ auth.user.role }} account</span>
        <p style="color:var(--muted)">{{ auth.user.email }}</p>
        <p style="color:var(--muted);font-size:13px">{{ notes[auth.user.role] }}</p>
        <button class="btn btn-ghost" style="width:100%" @click="out"><Icon name="logout" /> Log out</button>
      </aside>
      <div style="display:grid;gap:20px;min-width:0">
        <section id="saved" class="panel" style="scroll-margin-top:90px">
          <h2 style="font-size:20px;margin-bottom:14px">Saved homes ({{ store.savedItems.length }})</h2>
          <div v-if="store.savedItems.length" class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
            <PropertyCard v-for="p in store.savedItems" :key="p.id" :item="p" />
          </div>
          <div v-else class="empty" style="box-shadow:none;background:var(--bg)">
            <Icon name="heart" /><p>You have no saved homes yet.</p>
            <NuxtLink to="/" class="btn btn-navy">Browse properties</NuxtLink>
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
              <button class="icon-btn" :aria-label="`Delete request for ${i.title}`" @click="store.removeInquiry(i.id)"><Icon name="trash" /></button>
            </div>
          </div>
          <p v-else style="color:var(--muted)">No viewing requests yet. Open a property and tap “Request a viewing”.</p>
        </section>
      </div>
    </div>
  </div>
</template>
