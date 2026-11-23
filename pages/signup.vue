<script setup lang="ts">
import type { Role } from '~/stores/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign up | BahayHub Butuan' })

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const creds = useCredentialStore()
const ids = useIdCheckStore()
const ui = useUiStore()

const form = reactive({ name: '', email: '', password: '', confirm: '', role: (route.query.role === 'agent' ? 'agent' : 'client') as Role, terms: false })
const prc = reactive(newPrcForm())
const buyer = reactive(newBuyerForm())
const touched = reactive<Record<string, boolean>>({})
const showPw = ref(false)
const step = ref(1)
const loading = ref(false)
const serverError = ref('')
const success = ref(false)
const createdName = ref('')
const createdRole = ref<Role>('client')

const COPY = {
  client: {
    title: 'Find your next home in Butuan.',
    sub: 'Browsing homes is open to everyone. To keep buyers and agents safe, an account needs a quick identity check.',
    points: ['Create your account in two short steps.', 'Upload a valid government ID so an admin can verify you.', 'Verified buyers can message agents and save homes.']
  },
  agent: {
    title: 'Grow your business on BahayHub.',
    sub: 'Apply as an agent. Once an admin verifies your PRC license, you can post listings and reach buyers and renters in Butuan.',
    points: ['Submit your PRC license and supporting documents.', 'An admin reviews your application.', 'Get a PRC Verified badge and start posting listings.']
  }
}
const isAgent = computed(() => form.role === 'agent')
const copy = computed(() => COPY[isAgent.value ? 'agent' : 'client'])
const steps = computed(() => (isAgent.value ? ['Account', 'License & details', 'Documents'] : ['Account', 'Identity']))
const last = computed(() => step.value === steps.value.length)
watch(() => route.query.role, r => { form.role = r === 'agent' ? 'agent' : 'client' })
watch(() => form.role, r => { step.value = 1; if (route.query.role !== r) router.replace({ query: { ...route.query, role: r } }) })

const score = computed(() => passwordScore(form.password))
const scoreText = computed(() => ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][form.password ? Math.max(1, score.value) : 0] || '')

const accountErrors = computed(() => {
  const e: Record<string, string> = {}
  if (form.name.trim().length < 2) e.name = 'Please enter your full name.'
  if (!isEmail(form.email)) e.email = 'Enter a valid email address.'
  if (form.password.length < 8) e.password = 'Use at least 8 characters.'
  else if (!/\d/.test(form.password) || !/[A-Za-z]/.test(form.password)) e.password = 'Include at least one letter and one number.'
  if (form.confirm !== form.password || !form.confirm) e.confirm = 'Passwords do not match.'
  return e
})
const termsErr = computed(() => (form.terms ? '' : 'You need to accept the terms to continue.'))
// errors that block the current step
const stepErrors = computed<Record<string, string>>(() => {
  if (step.value === 1) return accountErrors.value
  if (isAgent.value) return step.value === 2 ? only(prcErrors(prc), PRC_INFO_KEYS) : { ...only(prcErrors(prc), PRC_INFO_KEYS, false), ...(termsErr.value ? { terms: termsErr.value } : {}) }
  return { ...buyerErrors(buyer), ...(termsErr.value ? { terms: termsErr.value } : {}) }
})

// Redirect already-logged-in users to their destination
watch(() => auth.user, u => {
  if (!u) return
  router.replace(u.role === 'agent' ? '/agent' : u.role === 'admin' ? '/admin' : '/')
}, { immediate: true })

function back() { step.value--; serverError.value = '' }
async function next() {
  touched['s' + step.value] = true
  serverError.value = ''
  if (Object.keys(stepErrors.value).length) { ui.toast('Please fix the highlighted fields.', 'error'); return }
  if (!last.value) { step.value++; return }
  loading.value = true
  const res = await auth.signup({ name: form.name, email: form.email, password: form.password, role: form.role })
  loading.value = false
  if (!res.ok) { serverError.value = res.error || 'Could not create the account.'; step.value = 1; return }
  // new accounts start as "Pending review" until an admin verifies the documents
  if (res.id) {
    if (isAgent.value) creds.submit({ agentId: res.id, fullName: form.name.trim(), ...credFrom(prc) })
    else ids.submit(res.id, form.name.trim(), buyer)
  }
  createdName.value = form.name.trim().split(' ')[0]
  createdRole.value = form.role
  success.value = true
}
</script>

<template>
  <div class="wrap auth" :class="{ 'auth-wide': isAgent }">
    <div class="auth-copy">
      <p class="eyebrow">BahayHub · Butuan City</p>
      <Transition name="swap" mode="out-in">
        <div :key="form.role">
          <h1>{{ copy.title }}</h1>
          <p>{{ copy.sub }}</p>
          <ul>
            <li v-for="t in copy.points" :key="t"><span class="tick"><Icon name="check" /></span>{{ t }}</li>
          </ul>
        </div>
      </Transition>
    </div>

    <div class="auth-card-wrap">
      <Transition name="page" mode="out-in">
        <!-- SUCCESS -->
        <div v-if="success" class="auth-card" style="text-align:center;padding:40px 32px">
          <p class="eyebrow" style="color:var(--green,#16a34a)">Account created</p>
          <h2 style="margin-bottom:10px">Welcome, {{ createdName }}!</h2>
          <p style="color:var(--muted);margin-bottom:8px">Your <strong>{{ createdRole }}</strong> account is saved and its documents are <strong>pending review</strong> by an admin.</p>
          <p style="color:var(--muted);font-size:14px;margin-bottom:28px">Please sign in to continue. You can check the review status after you log in.</p>
          <NuxtLink :to="{ path: '/login', query: { role: createdRole } }" class="btn btn-navy btn-lg" style="width:100%;justify-content:center">Sign in to your account →</NuxtLink>
        </div>

        <!-- FORM -->
        <div v-else>
          <div class="tabs" role="tablist" aria-label="Log in or sign up">
            <NuxtLink :to="{ path: '/login', query: { role: form.role } }" role="tab" aria-selected="false">Log in</NuxtLink>
            <span class="on" role="tab" aria-selected="true">Sign up</span>
          </div>
          <div class="auth-card">
            <p class="eyebrow">{{ isAgent ? 'Agent application' : 'Client sign-up' }}</p>
            <h2>{{ isAgent ? 'Apply as an agent' : 'Create an account' }}</h2>

            <ol class="x-steps" aria-label="Sign-up progress">
              <li v-for="(s, i) in steps" :key="s" :class="{ on: step === i + 1, done: step > i + 1 }" :aria-current="step === i + 1 ? 'step' : undefined">
                <span>{{ step > i + 1 ? '✓' : i + 1 }}</span>{{ s }}
              </li>
            </ol>

            <Transition name="err"><div v-if="serverError" class="alert error" role="alert"><Icon name="alert" />{{ serverError }}</div></Transition>

            <form novalidate @submit.prevent="next">
              <Transition name="swap" mode="out-in">
                <!-- step 1: account -->
                <div v-if="step === 1" key="s1">
                  <div class="role-btns" role="group" aria-label="Account type" style="margin-top:0">
                    <button type="button" :aria-pressed="form.role === 'client'" @click="form.role = 'client'">I’m a client</button>
                    <button type="button" :aria-pressed="form.role === 'agent'" @click="form.role = 'agent'">I’m an agent</button>
                  </div>
                  <div class="x-grid2">
                    <div class="form-row">
                      <label for="name">Full name</label>
                      <input id="name" v-model="form.name" class="input" autocomplete="name" :aria-invalid="touched.s1 && !!accountErrors.name" />
                      <p v-if="touched.s1 && accountErrors.name" class="err" role="alert">{{ accountErrors.name }}</p>
                    </div>
                    <div class="form-row">
                      <label for="s-email">Email</label>
                      <input id="s-email" v-model="form.email" type="email" class="input" autocomplete="email" :aria-invalid="touched.s1 && !!accountErrors.email" />
                      <p v-if="touched.s1 && accountErrors.email" class="err" role="alert">{{ accountErrors.email }}</p>
                    </div>
                    <div class="form-row">
                      <label for="s-pw">Password</label>
                      <div class="pw">
                        <input id="s-pw" v-model="form.password" :type="showPw ? 'text' : 'password'" class="input" autocomplete="new-password" :aria-invalid="touched.s1 && !!accountErrors.password" />
                        <button type="button" class="toggle" :aria-label="showPw ? 'Hide password' : 'Show password'" @click="showPw = !showPw">{{ showPw ? 'HIDE' : 'SHOW' }}</button>
                      </div>
                      <div class="meter" aria-hidden="true"><i v-for="n in 4" :key="n" :class="n <= score ? 'on' + score : ''" /></div>
                      <small style="color:var(--muted)">Strength: {{ scoreText }}</small>
                      <p v-if="touched.s1 && accountErrors.password" class="err" role="alert">{{ accountErrors.password }}</p>
                    </div>
                    <div class="form-row">
                      <label for="s-confirm">Confirm password</label>
                      <input id="s-confirm" v-model="form.confirm" :type="showPw ? 'text' : 'password'" class="input" autocomplete="new-password" :aria-invalid="touched.s1 && !!accountErrors.confirm" />
                      <p v-if="touched.s1 && accountErrors.confirm" class="err" role="alert">{{ accountErrors.confirm }}</p>
                    </div>
                  </div>
                </div>

                <!-- agent step 2 -->
                <div v-else-if="isAgent && step === 2" key="a2">
                  <PrcFields :form="prc" :show="!!touched.s2" prefix="su-" part="info" />
                </div>

                <!-- agent step 3 / client step 2 -->
                <div v-else :key="isAgent ? 'a3' : 'c2'">
                  <PrcFields v-if="isAgent" :form="prc" :show="!!touched.s3" prefix="su-" part="docs" />
                  <BuyerFields v-else :form="buyer" :show="!!touched.s2" prefix="su-" />
                  <div class="form-row" style="margin-top:6px">
                    <label class="check" style="font-weight:500"><input v-model="form.terms" type="checkbox" /><i class="box"><Icon name="check" /></i><span>I confirm these details are mine and understand this demo stores them in this browser only.</span></label>
                    <p v-if="touched['s' + step] && termsErr" class="err" role="alert">{{ termsErr }}</p>
                  </div>
                </div>
              </Transition>

              <div class="x-actions">
                <button v-if="step > 1" type="button" class="btn btn-ghost btn-lg" @click="back">← Back</button>
                <button class="btn btn-orange btn-lg" :disabled="loading"><span v-if="loading" class="spinner" /><template v-else>{{ last ? (isAgent ? 'Submit application' : 'Create account') : 'Continue →' }}</template></button>
              </div>
            </form>
            <p class="fine" style="margin-top:16px">Already have an account? <NuxtLink :to="{ path: '/login', query: { role: form.role } }" style="color:var(--navy);font-weight:700;text-decoration:underline">Log in</NuxtLink></p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
