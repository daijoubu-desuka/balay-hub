<script setup lang="ts">
import type { Role } from '~/stores/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Log in | BahayHub Butuan' })

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const role = ref<Role>((['client', 'agent', 'admin'].includes(route.query.role as string) ? route.query.role : 'client') as Role)
const form = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })
const showPw = ref(false)
const loading = ref(false)
const serverError = ref('')

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
const errors = computed(() => ({
  email: !form.email.trim() ? 'Please enter your email.' : !isEmail(form.email) ? 'Enter a valid email address.' : '',
  password: !form.password ? 'Please enter your password.' : form.password.length < 6 ? 'Password must be at least 6 characters.' : ''
}))
const demo: Record<Role, [string, string]> = {
  client: ['client@bahayhub.test', 'client123'],
  agent: ['agent@bahayhub.test', 'agent123'],
  admin: ['admin@bahayhub.test', 'admin123']
}

watch(role, () => { serverError.value = '' })
watch(() => auth.user, u => {
  if (!u) return
  const dest = u.role === 'agent' ? '/agent' : u.role === 'admin' ? '/admin' : '/'
  router.replace((route.query.redirect as string) || dest)
}, { immediate: true })

function fill() { [form.email, form.password] = demo[role.value] }

async function submit() {
  touched.email = touched.password = true
  serverError.value = ''
  if (errors.value.email || errors.value.password) return
  loading.value = true
  const res = await auth.login(form.email, form.password, role.value)
  loading.value = false
  if (!res.ok) { serverError.value = res.error || 'Could not sign in.'; return }
  ui.toast(`Welcome back! Signed in as ${role.value}.`, 'success')
  const dest = role.value === 'agent' ? '/agent' : role.value === 'admin' ? '/admin' : '/'
  router.push((route.query.redirect as string) || dest)
}
</script>

<template>
  <div class="wrap auth">
    <div class="auth-copy">
      <p class="eyebrow">BahayHub · Butuan City</p>
      <h1>{{ cap(role) }} workspace sign-in.</h1>
      <p>Sign in to your {{ cap(role) }} workspace. Account details are stored in this browser; this site does not provide secure account authentication.</p>
      <ul>
        <li v-if="role === 'client'"><span class="tick"><Icon name="check" /></span>Save homes, request viewings, and review local offer drafts.</li>
        <li v-else-if="role === 'agent'"><span class="tick"><Icon name="check" /></span>Review your listings and incoming viewing requests.</li>
        <li v-else><span class="tick"><Icon name="check" /></span>Oversee listings, agents and client accounts in one place.</li>
        <li><span class="tick"><Icon name="check" /></span>Manage profile preferences and document records stored in this browser.</li>
      </ul>
    </div>

    <div class="auth-card-wrap">
      <div class="tabs" role="tablist" aria-label="Log in or sign up">
        <span class="on" role="tab" aria-selected="true">Log in</span>
        <NuxtLink to="/signup" role="tab" aria-selected="false">Sign up</NuxtLink>
      </div>
    <div class="auth-card">
      <p class="eyebrow">Browser-based sign-in</p>
      <h2>Sign in as {{ cap(role) }}</h2>
      <p class="role-hint">
        <template v-if="role === 'client'">Browse saved homes, manage viewing requests and offers.</template>
        <template v-else-if="role === 'agent'">Review assigned requests, manage listings and appointments.</template>
        <template v-else>Oversee agents, review the client queue and manage listings.</template>
      </p>

      <Transition name="err"><div v-if="serverError" class="alert error" role="alert"><Icon name="alert" />{{ serverError }}</div></Transition>

      <form novalidate @submit.prevent="submit">
        <div class="form-row">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" class="input" placeholder="name@bahayhub.test" autocomplete="email" :aria-invalid="touched.email && !!errors.email" aria-describedby="email-err" @blur="touched.email = true" />
          <Transition name="err"><p v-if="touched.email && errors.email" id="email-err" class="err" role="alert">{{ errors.email }}</p></Transition>
        </div>
        <div class="form-row">
          <label for="password">Password</label>
          <div class="pw">
            <input id="password" v-model="form.password" :type="showPw ? 'text' : 'password'" class="input" placeholder="Enter your password" autocomplete="current-password" :aria-invalid="touched.password && !!errors.password" aria-describedby="pw-err" @blur="touched.password = true" />
            <button type="button" class="toggle" :aria-label="showPw ? 'Hide password' : 'Show password'" @click="showPw = !showPw">{{ showPw ? 'HIDE' : 'SHOW' }}</button>
          </div>
          <Transition name="err"><p v-if="touched.password && errors.password" id="pw-err" class="err" role="alert">{{ errors.password }}</p></Transition>
        </div>
        <button class="btn btn-navy btn-lg" style="width:100%" :disabled="loading">
          <span v-if="loading" class="spinner" /><template v-else>Sign in to {{ cap(role) }} workspace</template>
        </button>
      </form>

      <div class="cred">
        <b>{{ cap(role) }} sign-in credentials (demo)</b>
        {{ demo[role][0] }} / {{ demo[role][1] }} · <button type="button" @click="fill">Autofill</button>
      </div>

      <div class="row-between">
        <button type="button" @click="ui.toast('Password reset is not connected in this version.')">Forgot password?</button>
        <NuxtLink v-if="role !== 'admin'" :to="{ path: '/signup', query: { role } }">Create a {{ cap(role) }} profile</NuxtLink>
      </div>

      <div class="role-cards" role="group" aria-label="Choose workspace">
        <button type="button" :aria-pressed="role === 'client'" @click="role = 'client'">
          <span class="rc-icon">🏠</span>
          <span class="rc-label">Client</span>
          <span class="rc-desc">Save homes &amp; request viewings</span>
        </button>
        <button type="button" :aria-pressed="role === 'agent'" @click="role = 'agent'">
          <span class="rc-icon">📋</span>
          <span class="rc-label">Agent</span>
          <span class="rc-desc">Listings, requests &amp; appointments</span>
        </button>
        <button type="button" :aria-pressed="role === 'admin'" @click="role = 'admin'">
          <span class="rc-icon">🛡️</span>
          <span class="rc-label">Admin</span>
          <span class="rc-desc">Oversee agents, listings &amp; queue</span>
        </button>
      </div>
      <p class="fine">Passwords and session data are kept in this browser’s local storage. Secure authentication, email, text messages, and external sign-in services are not connected.</p>
    </div>
    </div>
  </div>
</template>
