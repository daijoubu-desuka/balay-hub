// Public agent directory, built from real app data: PRC records, listings, paid deals and client reviews.
export const agentSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function useAgents() {
  const creds = useCredentialStore()
  const props = usePropertyStore()
  const pay = usePaymentStore()
  const reviews = useReviewStore()
  const profiles = useProfileStore()
  const auth = useAuthStore()

  return computed(() => {
    // rejected licenses are not shown publicly
    const names = new Set([
      ...creds.items.filter(c => c.status !== 'Rejected').map(c => c.fullName),
      ...props.items.map(p => p.agent.name)
    ])
    return [...names].map(name => {
      const cred = creds.items.find(c => c.fullName === name)
      const account = auth.users.find(u => u.role === 'agent' && u.name === name)
      const id = cred?.agentId ?? account?.id ?? ''
      const listings = props.items.filter(p => p.agent.name === name)
      const st = reviews.stats(name)
      const prof = id ? profiles.of(id) : undefined
      const areas = (cred?.areas || [...new Set(listings.map(l => l.location))].join(', ')).split(',').map(a => a.trim()).filter(Boolean)
      return {
        name, slug: agentSlug(name), id, cred,
        accountId: account?.id ?? '', // only agents with a BahayHub login can be messaged directly
        verified: creds.isVerifiedName(name),
        status: cred?.status ?? 'Not submitted',
        licenseType: cred?.licenseType ?? 'Agent',
        years: cred?.years ?? 0,
        areas,
        listings,
        closed: pay.items.filter(p => p.agent === name && p.status === 'Paid').length,
        rating: st.avg, reviewCount: st.count,
        title: prof?.title || `${cred?.licenseType ?? 'Agent'} · Butuan City`,
        about: prof?.about || `${cred?.licenseType ?? 'Agent'} serving ${areas.slice(0, 3).join(', ') || 'Butuan City'}${cred?.years ? ` for ${cred.years} years` : ''}. Helps buyers and renters find, view and close on homes across Butuan City.`
      }
    }).sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating || b.listings.length - a.listings.length)
  })
}
