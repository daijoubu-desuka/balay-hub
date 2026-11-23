import { defineStore } from 'pinia'
import type { BuyerForm } from '~/composables/useValidators'

// Buyer (client) identity checks. Demo only: no real documents are stored, just file names.
export type IdStatus = 'Pending review' | 'Verified' | 'Rejected'
export interface IdCheck {
  userId: string; fullName: string; phone: string; idType: string; idLast4: string
  idPhoto: string; idPhotoUrl: string; status: IdStatus; rejectionReason: string; reviewedAt: string
}
const S = (userId: string, fullName: string, status: IdStatus, rejectionReason = ''): IdCheck =>
  ({ userId, fullName, phone: '09171234567', idType: 'PhilSys National ID', idLast4: '4821', idPhoto: 'id-front.jpg', idPhotoUrl: '', status, rejectionReason, reviewedAt: status === 'Pending review' ? '' : '2026-11-01' })

export const useIdCheckStore = defineStore('idchecks', {
  state: () => ({
    items: [S('u-client', 'Maria Santos', 'Verified'), S('seed-carlo', 'Carlo Mendoza', 'Pending review')] as IdCheck[]
  }),
  getters: {
    of: s => (id: string) => s.items.find(c => c.userId === id),
    isVerified: s => (id: string) => s.items.some(c => c.userId === id && c.status === 'Verified'),
    pendingCount: s => s.items.filter(c => c.status === 'Pending review').length
  },
  actions: {
    submit(userId: string, fullName: string, f: BuyerForm) {
      const next: IdCheck = {
        userId, fullName, phone: f.phone.replace(/[\s-]/g, ''), idType: f.idType, idLast4: f.idNumber.replace(/\W/g, '').slice(-4),
        idPhoto: f.idPhoto!.name, idPhotoUrl: f.idPhotoUrl, status: 'Pending review', rejectionReason: '', reviewedAt: ''
      }
      const i = this.items.findIndex(x => x.userId === userId)
      if (i < 0) this.items.push(next); else this.items[i] = next
      useNotifyStore().push({ type: 'prc', title: 'Buyer ID submitted', body: `${fullName} submitted an ID for review.`, link: `/admin?tab=verification&focus=${userId}`, to: 'admin' })
    },
    review(userId: string, ok: boolean, reason = '') {
      const c = this.items.find(x => x.userId === userId)
      if (!c) return
      c.status = ok ? 'Verified' : 'Rejected'
      c.rejectionReason = ok ? '' : reason
      c.reviewedAt = new Date().toISOString().slice(0, 10)
      useNotifyStore().push({
        type: 'prc', title: ok ? 'Identity verified' : 'Identity check rejected',
        body: ok ? 'You can now message agents.' : `Reason: ${reason}`, link: '/account#idcheck', to: 'name:' + nameOf(c.userId, c.fullName)
      })
    }
  }
})
