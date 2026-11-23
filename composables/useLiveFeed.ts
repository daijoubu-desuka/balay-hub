import type { Person } from '~/stores/messages'

// "Live demo" mode: in-browser sample events and simulated chat replies. No server.
const live = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pickOne = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

const SAMPLES: Record<string, { title: string; body: string; link: string; type: string }[]> = {
  admin: [
    { type: 'payment', title: 'Payment recorded', body: 'A new deal is waiting for approval.', link: '/admin?tab=payments' },
    { type: 'prc', title: 'PRC submission', body: 'An agent submitted a license for review.', link: '/admin?tab=verification' },
    { type: 'request', title: 'Viewing request submitted', body: 'A client asked for a viewing in Libertad.', link: '/admin?tab=client-reqs' }
  ],
  agent: [
    { type: 'request', title: 'Viewing request submitted', body: 'A client asked for a viewing on Saturday.', link: '/agent?tab=requests' },
    { type: 'payment', title: 'Payment marked Paid', body: 'One of your deals was approved by an admin.', link: '/agent?tab=commission' },
    { type: 'listing', title: 'Listing approved', body: 'Your listing draft passed review.', link: '/agent?tab=listings' }
  ],
  client: [
    { type: 'request', title: 'Request status changed', body: 'Your viewing request is now Tour Scheduled.', link: '/account#inquiries' }
  ]
}
const REPLIES: Record<string, string[]> = {
  agent: ['Tomorrow 3 PM works.', 'The unit is still available.', 'Please send your preferred date and I will book the viewing.'],
  admin: ['Thanks, we are looking into it now.', 'Noted. We will update you here shortly.'],
  client: ['Thank you! That time works for me.', 'Sounds good. Can I bring my family?']
}

export function useLiveFeed() {
  const auth = useAuthStore()
  const notify = useNotifyStore()
  const msgs = useMessageStore()

  function tick() {
    const u = auth.user
    if (u) notify.push({ ...pickOne(SAMPLES[u.role]), to: u.role })
    timer = setTimeout(tick, rand(20000, 40000))
  }
  function setLive(v: boolean) {
    live.value = v
    clearTimeout(timer)
    try { localStorage.setItem('bahayhub_live', v ? '1' : '0') } catch { /* ignore */ }
    if (v) timer = setTimeout(tick, rand(20000, 40000))
  }
  // typing dots, then an in-character reply after 2-4 s (only while Live demo is on)
  function simulateReply(threadId: string, from: Person) {
    if (!live.value) return
    const t = msgs.threads.find(x => x.id === threadId)
    if (!t) return
    const other = t.a.id === from.id ? t.b : t.a
    msgs.typing[threadId] = true
    setTimeout(() => {
      msgs.typing[threadId] = false
      msgs.markRead(threadId, other.id) // the "other person" has now read it
      msgs.send(threadId, other, pickOne(REPLIES[other.role]))
    }, rand(2000, 4000))
  }
  return { live, setLive, simulateReply }
}

import.meta.hot?.dispose(() => clearTimeout(timer))
