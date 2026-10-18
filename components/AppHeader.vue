<script setup lang="ts">
const auth = useAuthStore()
const props = usePropertyStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()

const menuOpen = ref(false)
const scrolled = ref(false)
const root = ref<HTMLElement | null>(null)

const isWorkspaceRole = computed(() => auth.user?.role === 'agent' || auth.user?.role === 'admin')

const links = [
  { to: '/', label: 'Browse Properties' },
  { to: '/new-developments', label: 'New Developments' },
  { to: '/commercial', label: 'Commercial' },
  { to: '/for-rent', label: 'For Rent' }
]

const workspaceLinks = computed(() => [
  auth.user?.role === 'agent'
    ? { to: '/agent', label: 'Agent Workspace' }
    : { to: '/admin', label: 'Admin Workspace' }
])

function onScroll() { scrolled.value = window.scrollY > 8 }
function onDoc(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) menuOpen.value = false
}
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { menuOpen.value = false; ui.mobileNav = false } }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onDoc)
  document.addEventListener('keydown', onKey)
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onDoc)
  document.removeEventListener('keydown', onKey)
})
watch(() => route.fullPath, () => { menuOpen.value = false; ui.mobileNav = false; ui.filterDrawer = false })
watch(() => ui.mobileNav, v => { if (import.meta.client) document.body.style.overflow = v ? 'hidden' : '' })

function logout() {
  auth.logout()
  menuOpen.value = false
  ui.mobileNav = false
  ui.toast('You have been logged out.', 'success')
  router.push('/login')
}
</script>

<template>
  <header class="header" :class="{ scrolled }">
    <div class="wrap header-in">
      <div class="brand">
        <NuxtLink to="/" aria-label="BahayHub home"><Logo :size="30" /></NuxtLink>
        <div class="loc-pill"><Icon name="pin" /><span>Butuan City, Agusan del Norte</span></div>
      </div>

      <nav class="nav" aria-label="Main">
        <template v-if="!isWorkspaceRole">
          <NuxtLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
        </template>
      </nav>

      <div class="head-actions" ref="root">
        <template v-if="!isWorkspaceRole">
          <NuxtLink class="icon-btn" :to="auth.isLoggedIn ? '/account#saved' : '/login'" aria-label="Saved properties">
            <Icon name="heart" /><span v-if="props.saved.length" class="badge-dot">{{ props.saved.length }}</span>
          </NuxtLink>
          <NuxtLink class="icon-btn" :to="auth.isLoggedIn ? '/account#inquiries' : '/login'" aria-label="Inquiries">
            <Icon name="bell" /><span v-if="props.inquiries.length" class="badge-dot">{{ props.inquiries.length }}</span>
          </NuxtLink>
        </template>

        <div class="acct">
          <button class="acct-btn" :aria-expanded="menuOpen" aria-haspopup="menu" @click.stop="menuOpen = !menuOpen">
            <span class="avatar" aria-hidden="true">
              <template v-if="auth.user">{{ auth.initials }}</template><Icon v-else name="user" />
            </span>
            <span class="acct-txt">
              <template v-if="auth.user"><b>{{ auth.user.name }}</b><small>{{ auth.user.role }} account</small></template>
              <template v-else><b>Login or Sign up</b><small>Welcome to BahayHub</small></template>
            </span>
            <Icon class="chev" name="chevron" />
          </button>
          <Transition name="pop">
            <div v-if="menuOpen" class="menu" role="menu">
              <template v-if="auth.user">
                <div class="menu-head"><b>{{ auth.user.name }}</b>{{ auth.user.email }}</div>
                <hr />
                <NuxtLink v-if="!isWorkspaceRole" to="/account" role="menuitem"><Icon name="user" /> My account</NuxtLink>
                <NuxtLink v-if="!isWorkspaceRole" to="/account#saved" role="menuitem"><Icon name="heart" /> Saved homes</NuxtLink>
                <hr />
                <button role="menuitem" @click="logout"><Icon name="logout" /> Log out</button>
              </template>
              <template v-else>
                <NuxtLink to="/login" role="menuitem"><Icon name="user" /> Log in</NuxtLink>
                <NuxtLink to="/signup" role="menuitem"><Icon name="check" /> Sign up</NuxtLink>
                <hr />
                <div class="menu-head">Log in as a client, agent, or admin.</div>
              </template>
            </div>
          </Transition>
        </div>
        <button class="icon-btn burger" aria-label="Open menu" @click="ui.mobileNav = true"><Icon name="menu" /></button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade"><div v-if="ui.mobileNav" class="drawer-mask" @click="ui.mobileNav = false" /></Transition>
      <Transition name="slide">
        <aside v-if="ui.mobileNav" class="drawer" aria-label="Menu">
          <div class="d-top">
            <Logo :size="26" />
            <button class="icon-btn" aria-label="Close menu" @click="ui.mobileNav = false"><Icon name="close" /></button>
          </div>
          <template v-if="!isWorkspaceRole">
            <NuxtLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
          </template>
          <hr style="border:0;border-top:1px solid var(--line);width:100%;margin:8px 0" />
          <template v-if="auth.user">
            <div class="menu-head" style="padding:4px 14px;color:var(--muted);font-size:12px"><b style="color:var(--ink);display:block;font-size:14px">{{ auth.user.name }}</b>{{ auth.user.role }} account</div>
            <NuxtLink v-if="!isWorkspaceRole" to="/account"><Icon name="user" /> My account</NuxtLink>
            <NuxtLink v-if="!isWorkspaceRole" to="/account#saved"><Icon name="heart" /> Saved homes ({{ props.saved.length }})</NuxtLink>
            <button class="d-btn" @click="logout"><Icon name="logout" /> Log out</button>
          </template>
          <template v-else>
            <NuxtLink class="btn btn-navy btn-lg" to="/login" style="color:#fff;justify-content:center">Log in</NuxtLink>
            <NuxtLink class="btn btn-ghost btn-lg" to="/signup" style="justify-content:center">Sign up</NuxtLink>
          </template>
        </aside>
      </Transition>
    </Teleport>
  </header>
</template>
