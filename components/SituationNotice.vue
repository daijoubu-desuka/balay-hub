<script setup lang="ts">
// One banner that tells each role what needs their attention right now. Dismiss hides it for this tab session.
const auth = useAuthStore()
const ids = useIdCheckStore()
const creds = useCredentialStore()
const pay = usePaymentStore()
const dismissed = ref<string[]>([])

type Notice = { key: string; tone: 'info' | 'warn' | 'bad' | 'ok'; title: string; text: string; to: string; cta: string }
const notice = computed<Notice | null>(() => {
  const u = auth.user
  if (!u) return null
  if (u.role === 'client') {
    const r = ids.of(u.id)
    if (!r) return { key: 'c-none', tone: 'info', title: 'Verify your identity', text: 'Upload a valid government ID to message agents. Browsing never needs it.', to: '/account#idcheck', cta: 'Verify now' }
    if (r.status === 'Pending review') return { key: 'c-pend', tone: 'warn', title: 'Your ID is being reviewed', text: 'An admin is checking it. You can still browse and save homes.', to: '/account#idcheck', cta: 'View status' }
    if (r.status === 'Rejected') return { key: 'c-rej', tone: 'bad', title: 'Your ID was not accepted', text: `Reason: ${r.rejectionReason}`, to: '/account#idcheck', cta: 'Resubmit' }
    return null
  }
  if (u.role === 'agent') {
    const c = creds.of(u.id)
    const days = c ? Math.round((new Date(c.expiryDate).getTime() - Date.now()) / 864e5) : 0
    if (!c) return { key: 'a-none', tone: 'info', title: 'Get PRC verified', text: 'Submit your PRC license to post and publish listings.', to: '/agent?tab=verification', cta: 'Submit license' }
    if (c.status === 'Pending review') return { key: 'a-pend', tone: 'warn', title: 'License under review', text: 'You can use the workspace; posting listings unlocks after approval.', to: '/agent?tab=verification', cta: 'View status' }
    if (c.status === 'Rejected') return { key: 'a-rej', tone: 'bad', title: 'License not accepted', text: `Reason: ${c.rejectionReason}`, to: '/agent?tab=verification', cta: 'Resubmit' }
    if (days <= 0) return { key: 'a-exp', tone: 'bad', title: 'Your PRC license has expired', text: 'Listings are locked until you submit a renewed license.', to: '/agent?tab=verification', cta: 'Renew' }
    if (days <= 60) return { key: 'a-soon', tone: 'warn', title: `PRC license expires in ${days} days`, text: 'Submit your renewal early to avoid a pause in listings.', to: '/agent?tab=verification', cta: 'Renew' }
    return null
  }
  const prc = creds.pendingCount, buyers = ids.pendingCount, payments = pay.items.filter(p => p.status === 'Pending').length
  if (prc + buyers) return { key: `ad-${prc}-${buyers}`, tone: 'warn', title: `${prc + buyers} verification${prc + buyers === 1 ? '' : 's'} waiting`, text: `${prc} PRC license${prc === 1 ? '' : 's'} and ${buyers} buyer ID${buyers === 1 ? '' : 's'} need a decision.`, to: '/admin?tab=verification', cta: 'Review' }
  if (payments) return { key: `ad-pay-${payments}`, tone: 'info', title: `${payments} payment${payments === 1 ? '' : 's'} pending`, text: 'Mark them Paid or Refunded so commission totals stay right.', to: '/admin?tab=payments', cta: 'Open log' }
  return null
})
</script>

<template>
  <Transition name="err">
    <div v-if="notice && !dismissed.includes(notice.key)" class="x-situ" :class="notice.tone" role="status">
      <Icon :name="notice.tone === 'bad' ? 'alert' : notice.tone === 'ok' ? 'check' : 'bell'" />
      <div><b>{{ notice.title }}</b><span>{{ notice.text }}</span></div>
      <NuxtLink :to="notice.to" class="btn btn-sm btn-navy">{{ notice.cta }} →</NuxtLink>
      <button class="icon-btn" aria-label="Dismiss notice" @click="dismissed.push(notice.key)"><Icon name="close" /></button>
    </div>
  </Transition>
</template>
