<script setup lang="ts">
const creds = useCredentialStore()
const ui = useUiStore()
useFocusRow()
const rejecting = ref('')
const reason = ref('')
const reasonErr = ref('')

function approve(id: string, name: string) { creds.review(id, true); ui.toast(`${name} is now PRC Verified.`, 'success') }
function reject(id: string, name: string) {
  if (reason.value.trim().length < 5) { reasonErr.value = 'Write a reason (at least 5 characters). The agent will see it.'; ui.toast('Please add a rejection reason.', 'error'); return }
  creds.review(id, false, reason.value.trim())
  ui.toast(`${name}'s license was rejected.`, 'info')
  rejecting.value = ''; reason.value = ''; reasonErr.value = ''
}
const viewing = ref<string>('')
const cur = computed(() => creds.items.find(c => c.agentId === viewing.value))
const face = useFace()
const cls = (s: string) => (s === 'Verified' ? 'paid' : s === 'Pending review' ? 'pending' : 'refunded')
</script>

<template>
  <div class="ws-panel-fade ws-card">
    <p class="ws-card-eyebrow">Verification queue</p>
    <h3 class="ws-card-title">Applications to review</h3>
    <p class="ws-card-sub">Approve or reject each PRC license submission. Rejected agents see your reason.</p>
    <TransitionGroup name="row" tag="div" class="x-rows">
      <div v-for="c in creds.items" :key="c.agentId" class="x-row" :data-focus="c.agentId">
        <button class="x-row-main x-tap" :aria-label="`View ${c.fullName}'s application`" @click="viewing = c.agentId">
          <span class="x-who"><img v-if="face(c.agentId)" :src="face(c.agentId)" alt="" class="x-ava" /><b>{{ c.fullName }}</b> <span class="x-muted">· {{ c.licenseType }}</span></span>
          <p class="x-muted">{{ prcLabel(c.prcLicenseNo) }} · expires {{ fmtMonth(c.expiryDate) }} · {{ c.document }}</p>
          <p v-if="c.status === 'Rejected'" class="x-reason">Reason: {{ c.rejectionReason }}</p>
          <span class="x-more">View application →</span>
        </button>
        <div v-if="rejecting === c.agentId" class="form-row" style="margin:0;flex-basis:100%;order:3">
            <label :for="'rj-' + c.agentId">Reason for rejecting</label>
            <input :id="'rj-' + c.agentId" v-model="reason" class="input" :aria-invalid="!!reasonErr" @keyup.enter="reject(c.agentId, c.fullName)" />
            <p v-if="reasonErr" class="err" role="alert">{{ reasonErr }}</p>
          </div>
        <div class="x-row-side">
          <span class="x-pill" :class="cls(c.status)">{{ c.status }}</span>
          <div v-if="c.status === 'Pending review'" style="display:flex;gap:8px">
            <button class="btn btn-navy btn-sm" @click="approve(c.agentId, c.fullName)">Approve</button>
            <button v-if="rejecting !== c.agentId" class="btn btn-ghost btn-sm" @click="rejecting = c.agentId; reason = ''; reasonErr = ''">Reject</button>
            <button v-else class="btn btn-orange btn-sm" @click="reject(c.agentId, c.fullName)">Confirm reject</button>
          </div>
        </div>
      </div>
    </TransitionGroup>
    <ContextDrawer :open="!!cur" :title="cur?.fullName ?? ''" eyebrow="PRC application" @close="viewing = ''">
      <template v-if="cur">
        <p><span class="x-pill" :class="cls(cur.status)">{{ cur.status }}</span></p>
        <div class="x-match" style="margin:14px 0">
          <IdCard :src="cur.licenseUrl" :face="face(cur.agentId)" :name="cur.fullName" kind="prc" label="PRC license" :number="cur.prcLicenseNo" />
          <figure class="x-idcard"><img v-if="face(cur.agentId)" :src="face(cur.agentId)" :alt="`2x2 photo of ${cur.fullName}`" class="x-selfie" /><div v-else class="x-selfie x-noface">No photo</div><figcaption>2x2 photo · compare the face</figcaption></figure>
        </div>
        <dl class="x-dl">
          <div><dt>License</dt><dd>{{ prcLabel(cur.prcLicenseNo) }} · {{ cur.licenseType }}</dd></div>
          <div><dt>Expires</dt><dd>{{ fmtMonth(cur.expiryDate) }}</dd></div>
          <div><dt>Experience</dt><dd>{{ cur.years }} years</dd></div>
          <div><dt>Areas served</dt><dd>{{ cur.areas }}</dd></div>
          <div v-if="cur.broker"><dt>Supervising broker</dt><dd>{{ cur.broker }}</dd></div>
          <div><dt>TIN</dt><dd>•••••{{ cur.tin.slice(-4) }}</dd></div>
          <div v-if="cur.reviewedAt"><dt>Reviewed</dt><dd>{{ cur.reviewedAt }}</dd></div>
        </dl>
        <p class="ws-card-eyebrow" style="margin:16px 0 6px">Submitted documents</p>
        <ul class="x-files">
          <li><span>PRC license photo</span><b>{{ cur.document }}</b></li>
          <li v-for="f in cur.files" :key="f.label"><span>{{ f.label }}</span><b>{{ f.name }}</b></li>
        </ul>
        <p v-if="cur.status === 'Rejected'" class="x-reason" style="margin-top:12px">Reason: {{ cur.rejectionReason }}</p>
        <div v-if="cur.status === 'Pending review'" style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-navy btn-sm" @click="approve(cur.agentId, cur.fullName); viewing = ''">Approve</button>
          <button class="btn btn-ghost btn-sm" @click="rejecting = cur.agentId; reason = ''; reasonErr = ''; viewing = ''">Reject…</button>
        </div>
      </template>
    </ContextDrawer>
  </div>
</template>
