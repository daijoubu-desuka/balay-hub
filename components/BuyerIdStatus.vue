<script setup lang="ts">
// Client "My account" card: identity check status, with a resubmit form if it was rejected or never sent.
const auth = useAuthStore()
const ids = useIdCheckStore()
const face = useFace()
const ui = useUiStore()
const rec = computed(() => (auth.user ? ids.of(auth.user.id) : undefined))
const form = reactive(newBuyerForm())
const show = ref(false)

function submit() {
  show.value = true
  if (Object.keys(buyerErrors(form)).length || !auth.user) { ui.toast('Please fix the highlighted fields.', 'error'); return }
  ids.submit(auth.user.id, auth.user.name, form)
  Object.assign(form, newBuyerForm()); show.value = false
  ui.toast('ID submitted. An admin will review it.', 'success')
}
const cls = (s: string) => (s === 'Verified' ? 'paid' : s === 'Pending review' ? 'pending' : 'refunded')
</script>

<template>
  <section id="idcheck" class="panel" style="scroll-margin-top:90px">
    <h2 style="font-size:20px;margin-bottom:10px">Identity check</h2>
    <template v-if="rec">
      <p><span class="x-pill" :class="cls(rec.status)">{{ rec.status }}</span></p>
      <div class="x-match" style="margin:12px 0">
        <IdCard :src="rec.idPhotoUrl" :face="face(rec.userId)" :name="rec.fullName" kind="id" :label="rec.idType" :number="'•••• ' + rec.idLast4" />
      </div>
      <p v-if="rec.status === 'Verified'" class="x-muted">Your identity is verified. You can message agents.</p>
      <p v-else-if="rec.status === 'Pending review'" class="x-muted">An admin is reviewing your ID. You can still browse and save homes.</p>
      <p v-else class="x-reason">Reason: {{ rec.rejectionReason }}</p>
    </template>
    <p v-else class="x-muted">Verify your identity to message agents. Browsing homes never needs it.</p>
    <form v-if="!rec || rec.status === 'Rejected'" novalidate style="margin-top:14px" @submit.prevent="submit">
      <BuyerFields :form="form" :show="show" prefix="ac-" />
      <button class="btn btn-orange">Submit for review →</button>
    </form>
  </section>
</template>
