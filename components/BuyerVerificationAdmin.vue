<script setup lang="ts">
const ids = useIdCheckStore()
const face = useFace()
const ui = useUiStore()
useFocusRow()
const rejecting = ref('')
const reason = ref('')
const err = ref('')

function approve(c: { userId: string; fullName: string }) { ids.review(c.userId, true); ui.toast(`${nameOf(c.userId, c.fullName)} is now a verified buyer.`, 'success') }
function reject(c: { userId: string; fullName: string }) {
  if (reason.value.trim().length < 5) { err.value = 'Write a reason (at least 5 characters). The buyer will see it.'; ui.toast('Please add a rejection reason.', 'error'); return }
  ids.review(c.userId, false, reason.value.trim())
  ui.toast(`${nameOf(c.userId, c.fullName)}'s ID was rejected.`, 'info')
  rejecting.value = ''; reason.value = ''; err.value = ''
}
const cls = (s: string) => (s === 'Verified' ? 'paid' : s === 'Pending review' ? 'pending' : 'refunded')
</script>

<template>
  <div class="ws-card" style="margin-top:16px">
    <p class="ws-card-eyebrow">Buyer identity checks</p>
    <h3 class="ws-card-title">Buyers to verify</h3>
    <p class="ws-card-sub">Check that the ID is valid, readable and matches the account name, then approve or reject. Rejected buyers see your reason.</p>
    <TransitionGroup name="row" tag="div" class="x-rows">
      <div v-for="c in ids.items" :key="c.userId" class="x-row" :data-focus="c.userId">
        <div class="x-row-main">
          <b>{{ nameOf(c.userId, c.fullName) }}</b>
          <p class="x-muted">{{ c.idType }} ending {{ c.idLast4 }} · {{ c.phone }} · file {{ c.idPhoto }}</p>
          <div class="x-match">
            <IdCard :src="c.idPhotoUrl" :face="face(c.userId)" :name="nameOf(c.userId, c.fullName)" kind="id" :label="c.idType" :number="'•••• ' + c.idLast4" />
          </div>
          <p v-if="c.status === 'Rejected'" class="x-reason">Reason: {{ c.rejectionReason }}</p>
          <div v-if="rejecting === c.userId" class="form-row" style="margin:10px 0 0">
            <label :for="'bj-' + c.userId">Reason for rejecting</label>
            <input :id="'bj-' + c.userId" v-model="reason" class="input" :aria-invalid="!!err" @keyup.enter="reject(c)" />
            <p v-if="err" class="err" role="alert">{{ err }}</p>
          </div>
        </div>
        <div class="x-row-side">
          <span class="x-pill" :class="cls(c.status)">{{ c.status }}</span>
          <div v-if="c.status === 'Pending review'" style="display:flex;gap:8px">
            <button class="btn btn-navy btn-sm" @click="approve(c)">Approve</button>
            <button v-if="rejecting !== c.userId" class="btn btn-ghost btn-sm" @click="rejecting = c.userId; reason = ''; err = ''">Reject</button>
            <button v-else class="btn btn-orange btn-sm" @click="reject(c)">Confirm reject</button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
