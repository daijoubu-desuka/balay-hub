// Frontend-only persistence: stores -> localStorage, and cross-tab sync with BroadcastChannel
// (the browser's `storage` event is the fallback). No server involved.
export default defineNuxtPlugin(() => {
  const notify = useNotifyStore()
  const auth = useAuthStore()
  const ui = useUiStore()

  const targets: [string, any, string[]][] = [
    ['bahayhub_payments', usePaymentStore(), ['items', 'activity']],
    ['bahayhub_notifications', notify, ['items']],
    ['bahayhub_credentials', useCredentialStore(), ['items']],
    ['bahayhub_idchecks', useIdCheckStore(), ['items']],
    ['bahayhub_profiles', useProfileStore(), ['items']],
    ['bahayhub_reviews', useReviewStore(), ['items']],
    ['bahayhub_messages', useMessageStore(), ['threads']]
  ]
  // seeds added in newer versions must also reach browsers that already saved older data
  const credSeed = useCredentialStore().items.map(c => ({ ...c }))
  const bc = 'BroadcastChannel' in window ? new BroadcastChannel('bahayhub') : null
  const stops: (() => void)[] = []

  const pick = (store: any, fields: string[]) => Object.fromEntries(fields.map(f => [f, store[f]]))
  const load = ([key, store]: [string, any, string[]]) => {
    try { const raw = localStorage.getItem(key); if (raw) store.$patch(JSON.parse(raw)) } catch { /* storage blocked or corrupt */ }
  }

  for (const t of targets) {
    const [key, store, fields] = t
    load(t)
    stops.push(watch(() => pick(store, fields), v => {
      try {
        const json = JSON.stringify(v)
        if (json === localStorage.getItem(key)) return // came from another tab: no echo
        localStorage.setItem(key, json)
        bc?.postMessage(key)
      } catch { /* storage full or blocked */ }
    }, { deep: true }))
  }

  // every fresh start: drop old notices (read ones, and anything older than 10 min) so the bell opens clear
  const cutoff = Date.now() - 10 * 60000
  notify.items = notify.items.filter(n => !n.read && new Date(n.createdAt).getTime() > cutoff)
  localStorage.removeItem('bahayhub_live')

  const creds = useCredentialStore()
  for (const c of credSeed) if (!creds.items.some(x => x.agentId === c.agentId)) creds.items.push(c)

  const onSync = (key: string | null) => { const t = targets.find(x => x[0] === key); if (t) load(t) }
  const onStorage = (e: StorageEvent) => onSync(e.key)
  if (bc) bc.onmessage = e => onSync(e.data)
  else window.addEventListener('storage', onStorage)

  // each new notification for this user also appears as a toast (also when it came from another tab)
  let lastId = notify.items[0]?.id
  stops.push(watch(() => notify.items[0]?.id, id => {
    if (!id || id === lastId) return
    lastId = id
    const n = notify.items[0]
    if (auth.user && notify.forUser(auth.user).some(x => x.id === n.id)) ui.toast(`${n.title}: ${n.body}`, 'info', n.link, n.id)
  }))


  import.meta.hot?.dispose(() => {
    stops.forEach(s => s())
    bc?.close()
    window.removeEventListener('storage', onStorage)
  })
})
