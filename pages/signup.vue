<script setup lang="ts">
import type { Role } from '~/stores/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign up | BahayHub Butuan' })

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '', confirm: '', role: (route.query.role === 'agent' ? 'agent' : 'client') as Role, terms: false })
const touched = reactive<Record<string, boolean>>({})
const showPw = ref(false)
const loading = ref(false)
const serverError = ref('')
const success = ref(false)
const createdName = ref('')
const createdRole = ref<Role>('client')
const score = computed(() => passwordScore(form.password))
const scoreText = computed(() => ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][form.password ? Math.max(1, score.value) : 0] || '')

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (form.name.trim().length < 2) e.name = 'Please enter your full name.'
  if (!isEmail(form.email)) e.email = 'Enter a valid email address.'
  if (form.password.length < 8) e.password = 'Use at least 8 characters.'
  else if (!/\d/.test(form.password) || !/[A-Za-z]/.test(form.password)) e.password = 'Include at least one letter and one number.'
  if (form.confirm !== form.password || !form.confirm) e.confirm = 'Passwords do not match.'
  if (!form.terms) e.terms = 'You need to accept the terms to continue.'
  return e
})

// Redirect already-logged-in users to their destination
watch(() => auth.user, u => {
  if (!u) return
  router.replace(u.role === 'agent' ? '/agent' : u.role === 'admin' ? '/admin' : '/')
}, { immediate: true })

async function submit() {
  Object.keys(form).forEach(k => (touched[k] = true))
  serverError.value = ''
  if (Object.keys(errors.value).length) return
  loading.value = true
  const res = await auth.signup({ name: form.name, email: form.email, password: form.password, role: form.role })
  loading.value = false
  if (!res.ok) { serverError.value = res.error || 'Could not create the account.'; return }
  // Show success screen — do NOT auto-navigate
  createdName.value = form.name.trim().split(' ')[0]
  createdRole.value = form.role
  success.value = true
}
</script>

<template>
  <div class="wrap auth">
    <div class="auth-copy">
      <p class="eyebrow">BahayHub · Butuan City</p>
      <h1>Create your free profile.</h1>
      <p>Join as a client to save homes and request viewings, or as an agent to prepare listings. Your profile is stored in this browser for the midterm demo.</p>
      <ul>
        <li><span class="tick"><Icon name="check" /></span>Save homes and compare them later.</li>
        <li><span class="tick"><Icon name="check" /></span>Send viewing requests in a few taps.</li>
        <li><span class="tick"><Icon name="check" /></span>No payment details are asked for.</li>
      </ul>
    </div>

    <div class="auth-card-wrap">
      <!-- SUCCESS STATE -->
      <Transition name="page" mode="out-in">
        <div v-if="success" class="auth-card" style="text-align:center;padding:40px 32px">
          <div style="font-size:3rem;margin-bottom:16px">🎉</div>
          <p class="eyebrow" style="color:var(--green,#16a34a)">Account created!</p>
          <h2 style="margin-bottom:10px">Welcome, {{ createdName }}!</h2>
          <p style="color:var(--muted);margin-bottom:8px">Your <strong>{{ createdRole }}</strong> account has been saved to this browser.</p>
          <p style="color:var(--muted);font-size:14px;margin-bottom:28px">You are not logged in yet — please sign in to continue.</p>
          <NuxtLink :to="{ path: '/login', query: { role: createdRole } }" class="btn btn-navy btn-lg" style="width:100%;justify-content:center">Sign in to your account →</NuxtLink>
        </div>

        <!-- FORM STATE -->
        <div v-else>
          <div class="tabs" role="tablist" aria-label="Log in or sign up">
            <NuxtLink :to="{ path: '/login', query: { role: form.role } }" role="tab" aria-selected="false">Log in</NuxtLink>
            <span class="on" role="tab" aria-selected="true">Sign up</span>
          </div>
      <div class="auth-card">
        <p class="eyebrow">Browser-based sign-up</p>
        <h2>Create an account</h2>


      <Transition name="err"><div v-if="serverError" class="alert error" role="alert"><Icon name="alert" />{{ serverError }}</div></Transition>

      <form novalidate @submit.prevent="submit">
        <div class="role-btns" role="group" aria-label="Account type" style="margin-top:0">
          <button type="button" :aria-pressed="form.role === 'client'" @click="form.role = 'client'">I’m a client</button>
          <button type="button" :aria-pressed="form.role === 'agent'" @click="form.role = 'agent'">I’m an agent</button>
        </div>
        <div class="form-row">
          <label for="name">Full name</label>
          <input id="name" v-model="form.name" class="input" autocomplete="name" :aria-invalid="touched.name && !!errors.name" @blur="touched.name = true" />
          <Transition name="err"><p v-if="touched.name && errors.name" class="err" role="alert">{{ errors.name }}</p></Transition>
        </div>
        <div class="form-row">
          <label for="s-email">Email</label>
          <input id="s-email" v-model="form.email" type="email" class="input" autocomplete="email" :aria-invalid="touched.email && !!errors.email" @blur="touched.email = true" />
          <Transition name="err"><p v-if="touched.email && errors.email" class="err" role="alert">{{ errors.email }}</p></Transition>
        </div>
        <div class="form-row">
          <label for="s-pw">Password</label>
          <div class="pw">
            <input id="s-pw" v-model="form.password" :type="showPw ? 'text' : 'password'" class="input" autocomplete="new-password" :aria-invalid="touched.password && !!errors.password" @blur="touched.password = true" />
            <button type="button" class="toggle" :aria-label="showPw ? 'Hide password' : 'Show password'" @click="showPw = !showPw">{{ showPw ? 'HIDE' : 'SHOW' }}</button>
          </div>
          <div class="meter" aria-hidden="true"><i v-for="n in 4" :key="n" :class="n <= score ? 'on' + score : ''" /></div>
          <small style="color:var(--muted)">Strength: {{ scoreText }}</small>
          <Transition name="err"><p v-if="touched.password && errors.password" class="err" role="alert">{{ errors.password }}</p></Transition>
        </div>
        <div class="form-row">
          <label for="s-confirm">Confirm password</label>
          <input id="s-confirm" v-model="form.confirm" :type="showPw ? 'text' : 'password'" class="input" autocomplete="new-password" :aria-invalid="touched.confirm && !!errors.confirm" @blur="touched.confirm = true" />
          <Transition name="err"><p v-if="touched.confirm && errors.confirm" class="err" role="alert">{{ errors.confirm }}</p></Transition>
        </div>
        <div class="form-row">
          <label class="check" style="font-weight:500"><input v-model="form.terms" type="checkbox" /><i class="box"><Icon name="check" /></i><span>I understand this demo stores my details in this browser only.</span></label>
          <Transition name="err"><p v-if="touched.terms && errors.terms" class="err" role="alert">{{ errors.terms }}</p></Transition>
        </div>
        <button class="btn btn-orange btn-lg" style="width:100%" :disabled="loading"><span v-if="loading" class="spinner" /><template v-else>Create account</template></button>
      </form>
      <p class="fine" style="margin-top:16px">Already have an account? <NuxtLink :to="{ path: '/login', query: { role: form.role } }" style="color:var(--navy);font-weight:700;text-decoration:underline">Log in</NuxtLink></p>
    </div>
    </div><!-- end v-else form -->
      </Transition>
    </div><!-- end auth-card-wrap -->
  </div>
</template>
