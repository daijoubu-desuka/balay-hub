<script setup lang="ts">
const auth = useAuthStore()
const creds = useCredentialStore()
const ui = useUiStore()
const face = useFace()
const cred = computed(() => (auth.user ? creds.of(auth.user.id) : undefined))
const form = reactive(newPrcForm())
const show = ref(false)
const open = ref(false)
const canSubmit = computed(() => !cred.value || cred.value.status === 'Rejected' || cred.value.status === 'Expired' || open.value)
const checklist = computed(() => {
  const e = prcErrors(form)
  return [
    ['License number (7 digits)', !e.no], ['License type', true], ['Expiry date in the future', !e.expiry],
    ['Clear photo of the license', !e.file], ['Experience, areas, TIN (and broker if salesperson)', !(e.years || e.areas || e.tin || e.broker)],
    ['Required documents (ID, resume, clearance, photo, PTR)', !PRC_DOCS.some(d => e[d.key])], ['Consent box ticked', !e.consent]
  ] as [string, boolean][]
})

function submit() {
  show.value = true
  if (Object.keys(prcErrors(form)).length || !auth.user) { ui.toast('Please fix the highlighted fields.', 'error'); return }
  creds.submit({ agentId: auth.user.id, fullName: auth.user.name, ...credFrom(form) })
  Object.assign(form, newPrcForm()); show.value = false; open.value = false
  ui.toast('License submitted. An admin will review it.', 'success')
}
const cls = (s: string) => (s === 'Verified' ? 'paid' : s === 'Pending review' ? 'pending' : 'refunded')
</script>

<template>
  <div class="ws-panel-fade ws-grid2">
    <div class="ws-card">
      <p class="ws-card-eyebrow">PRC verification</p>
      <h3 class="ws-card-title">Your license status</h3>
      <template v-if="cred">
        <p style="margin:10px 0"><span class="x-pill" :class="cls(cred.status)">{{ cred.status }}</span> <VerifiedBadge v-if="cred.status === 'Verified'" /></p>
        <div class="x-match" style="margin:12px 0">
          <IdCard :src="cred.licenseUrl" :face="face(cred.agentId)" :name="cred.fullName" kind="prc" label="PRC license" :number="maskPrc(cred.prcLicenseNo)" />
          <figure class="x-idcard"><img v-if="face(cred.agentId)" :src="face(cred.agentId)" alt="Your 2x2 photo" class="x-selfie" /><figcaption>Your 2x2 photo</figcaption></figure>
        </div>
        <p class="x-muted">{{ maskPrc(cred.prcLicenseNo) }} · {{ cred.licenseType }} · expires {{ fmtMonth(cred.expiryDate) }}</p>
        <p v-if="cred.status === 'Rejected'" class="x-reason">Reason: {{ cred.rejectionReason }}</p>
        <ul class="x-files" aria-label="Submitted documents"><li v-for="f in cred.files" :key="f.label"><span>{{ f.label }}</span><b>{{ f.name }}</b></li></ul>
        <p v-if="cred.status === 'Pending review'" class="x-muted" style="margin-top:8px">An admin is reviewing your license. You can use the rest of the workspace meanwhile.</p>
        <button v-if="cred.status === 'Verified' && !open" class="btn btn-ghost btn-sm" style="margin-top:12px" @click="open = true">Submit a renewed license</button>
      </template>
      <p v-else class="x-muted" style="margin-top:8px">You have not submitted a PRC license yet.</p>
      <p class="ws-card-eyebrow" style="margin-top:20px">Requirements</p>
      <ul class="x-check" aria-label="Requirements checklist">
        <li v-for="[t, ok] in checklist" :key="t"><span :class="{ ok }" aria-hidden="true">{{ ok ? '✓' : '○' }}</span>{{ t }}<span class="sr-only">{{ ok ? ' (done)' : ' (not done)' }}</span></li>
      </ul>
      <p class="x-muted" style="font-size:12px;margin-top:10px">Not verified yet? You cannot post or publish listings until an admin approves your license.</p>
    </div>
    <div class="ws-card">
      <h3 class="ws-card-title">{{ cred ? 'Resubmit your license' : 'Submit your license' }}</h3>
      <form v-if="canSubmit" novalidate @submit.prevent="submit">
        <PrcFields :form="form" :show="show" prefix="av-" />
        <button type="submit" class="btn btn-orange">Submit for review →</button>
      </form>
      <p v-else class="x-muted">A submission is {{ cred?.status === 'Verified' ? 'already verified' : 'under review' }}. This form opens again if it is rejected.</p>
    </div>
  </div>
</template>
