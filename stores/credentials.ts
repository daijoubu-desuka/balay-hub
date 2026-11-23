import { defineStore } from 'pinia'
import { PRC_DOCS, type PrcForm } from '~/composables/useValidators'

export type PrcStatus = 'Pending review' | 'Verified' | 'Rejected' | 'Expired'
export interface Credential {
  agentId: string; fullName: string; prcLicenseNo: string; licenseType: 'Real Estate Broker' | 'Salesperson'
  expiryDate: string; document: string; status: PrcStatus; rejectionReason: string; reviewedAt: string
  years: number; areas: string; broker: string; tin: string; files: { label: string; name: string }[]
  licenseUrl?: string; photoUrl?: string
}
export const credFrom = (f: PrcForm) => ({
  prcLicenseNo: f.no, licenseType: f.type, expiryDate: f.expiry, document: f.file!.name, years: +f.years, areas: f.areas.trim(),
  broker: f.type === 'Salesperson' ? f.broker.trim() : '', tin: f.tin.replace(/\D/g, ''), licenseUrl: f.fileUrl, photoUrl: f.photoUrl,
  files: PRC_DOCS.filter(d => f.docs[d.key]).map(d => ({ label: d.label, name: f.docs[d.key]!.name }))
})
const C = (agentId: string, fullName: string, no: string, licenseType: Credential['licenseType'], expiryDate: string, status: PrcStatus, rejectionReason = '', x: Partial<Credential> = {}): Credential =>
  ({ agentId, fullName, prcLicenseNo: no, licenseType, expiryDate, document: 'license.jpg', status, years: 6, areas: 'Butuan City, Agusan del Norte', broker: licenseType === 'Salesperson' ? 'Rica Santos' : '', tin: '123456789',
    files: ['Government-issued ID', 'Resume / CV', 'NBI or police clearance', '2x2 photo', 'Professional Tax Receipt (PTR)'].map(label => ({ label, name: label.split(' ')[0].toLowerCase() + '.pdf' })), rejectionReason, photoUrl: DEMO_FACES[agentId], reviewedAt: status === 'Pending review' ? '' : '2026-11-01', ...x })

const today = () => new Date().toISOString().slice(0, 10)

export const useCredentialStore = defineStore('credentials', {
  state: () => ({
    items: [
      C('u-agent', 'Rica Santos', '0019442', 'Real Estate Broker', '2027-08-31', 'Verified', '', { years: 9, areas: 'Libertad, Villa Kananga, Doongan' }),
      C('seed-leo', 'Leo Ocampo', '0021877', 'Salesperson', '2027-03-31', 'Verified', '', { years: 4, areas: 'J.C. Aquino Avenue, Ampayon' }),
      C('seed-jon', 'Jon Pelayo', '0023310', 'Salesperson', '2026-12-31', 'Rejected', 'ID photo is blurry. Please upload a clearer copy.'),
      C('seed-dan', 'Daniel Bantillo', '0025561', 'Real Estate Broker', '2028-01-31', 'Pending review', '', { years: 7, areas: 'Baan Riverside, J.C. Aquino Avenue, Bancasi' }),
      // agents who already list properties on BahayHub
      C('seed-anthony', 'Anthony Adlawon', '0031207', 'Real Estate Broker', '2028-03-31', 'Verified', '', { years: 8, areas: 'Libertad, Villa Kananga, Baan Riverside' }),
      C('seed-ace', 'Ace Nathaniel Magbanua', '0032518', 'Real Estate Broker', '2027-11-30', 'Verified', '', { years: 6, areas: 'J.C. Aquino Avenue, Doongan, Bancasi' }),
      C('seed-jm', 'John Mark Lugsanay', '0033964', 'Salesperson', '2027-06-30', 'Verified', '', { years: 3, areas: 'Ampayon, Taguibo, Langihan', broker: 'Anthony Adlawon' })
    ] as Credential[]
  }),
  getters: {
    of: s => (agentId: string) => s.items.find(c => c.agentId === agentId),
    // listing cards only know the agent's name
    isVerifiedName: s => (name: string) => s.items.some(c => c.fullName === name && c.status === 'Verified' && c.expiryDate >= today()),
    isVerified: s => (agentId: string) => s.items.some(c => c.agentId === agentId && c.status === 'Verified' && c.expiryDate >= today()),
    pendingCount: s => s.items.filter(c => c.status === 'Pending review').length
  },
  actions: {
    submit(c: Omit<Credential, 'status' | 'rejectionReason' | 'reviewedAt'>) {
      const i = this.items.findIndex(x => x.agentId === c.agentId)
      const next: Credential = { ...c, status: 'Pending review', rejectionReason: '', reviewedAt: '' }
      if (i < 0) this.items.push(next); else this.items[i] = next
      useNotifyStore().push({ type: 'prc', title: 'PRC submission', body: `${c.fullName} submitted a PRC license for review.`, link: `/admin?tab=verification&focus=${c.agentId}`, to: 'admin' })
    },
    review(agentId: string, ok: boolean, reason = '') {
      const c = this.items.find(x => x.agentId === agentId)
      if (!c) return
      c.status = ok ? 'Verified' : 'Rejected'
      c.rejectionReason = ok ? '' : reason
      c.reviewedAt = today()
      useNotifyStore().push({
        type: 'prc', title: ok ? 'PRC license approved' : 'PRC license rejected',
        body: ok ? 'You are now PRC Verified and can post listings.' : `Reason: ${reason}`,
        link: '/agent?tab=verification', to: 'name:' + c.fullName
      })
    }
  }
})
