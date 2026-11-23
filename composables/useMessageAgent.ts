// "Message agent": opens or creates a thread tied to a property, then goes to the Messages page.
// Agents without a BahayHub login (they only list properties) fall back to the demo agent account.
export function useMessageAgent() {
  const auth = useAuthStore()
  const msgs = useMessageStore()
  const ui = useUiStore()
  const router = useRouter()
  const route = useRoute()
  return (prop?: { id: string; title: string } | null, agentId = 'u-agent') => {
    const u = auth.user
    if (!u) {
      ui.toast('Please log in to message an agent.')
      return router.push({ path: '/login', query: { redirect: route.fullPath } })
    }
    if (u.role === 'client' && !useIdCheckStore().isVerified(u.id)) {
      ui.toast('Verify your identity first to message agents. See My account.', 'error')
      return router.push('/account')
    }
    const agent = auth.users.find(x => x.id === agentId && x.role === 'agent') ?? auth.users.find(x => x.id === 'u-agent')
    if (!agent) return
    const id = msgs.open({ id: u.id, name: u.name, role: u.role }, { id: agent.id, name: agent.name, role: 'agent' }, prop ?? undefined)
    if (!id) return ui.toast('Only clients can message an agent about a property.', 'error')
    router.push({ path: '/messages', query: { t: id } })
  }
}
