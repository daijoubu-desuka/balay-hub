import { defineStore } from 'pinia'

export type PayStatus = 'Pending' | 'Paid' | 'Refunded'
export interface Payment {
  id: string; date: string; type: 'Sale' | 'Rent'; clientName: string; propertyTitle: string; location: string
  agent: string; amount: number; monthlyRent?: number; leaseMonths?: number; commission: number; status: PayStatus
}
export interface Activity { id: string; at: string; text: string }

const P = (n: number, date: string, type: 'Sale' | 'Rent', clientName: string, propertyTitle: string, location: string, amount: number, status: PayStatus, agent: string, rent?: [number, number]): Payment =>
  ({ id: 'PAY-' + String(n).padStart(4, '0'), date, type, clientName, propertyTitle, location, agent, amount, commission: commissionOf(amount), status, ...(rent ? { monthlyRent: rent[0], leaseMonths: rent[1] } : {}) })

const seed = (): Payment[] => [
  P(10, '2026-11-11', 'Rent', 'R. Villanueva', 'Condo Suite', 'J.C. Aquino Ave', 528000, 'Pending', 'Leo Ocampo', [22000, 24]),
  P(9, '2026-11-09', 'Rent', 'C. Magallanes', 'Apartment', 'Libertad', 180000, 'Paid', 'Rica Santos', [15000, 12]),
  P(8, '2026-11-10', 'Sale', 'M. Dela Cruz', 'House and Lot', 'Villa Kananga', 6400000, 'Paid', 'Rica Santos'),
  P(7, '2026-11-08', 'Sale', 'A. Quimpo', 'Condo Suite', 'J.C. Aquino Ave', 3850000, 'Paid', 'Leo Ocampo'),
  P(6, '2026-11-06', 'Sale', 'J. Tan', 'Townhouse', 'Baan Riverside', 5200000, 'Pending', 'Rica Santos'),
  P(5, '2026-11-04', 'Sale', 'Pelayo Trading', 'Commercial', 'Bancasi', 12500000, 'Paid', 'Jon Pelayo'),
  P(4, '2026-11-02', 'Sale', 'S. Bacalso', 'Lot', 'Ampayon', 1900000, 'Refunded', 'Leo Ocampo'),
  P(3, '2026-10-30', 'Sale', 'K. Uy', 'House and Lot', 'Libertad', 4750000, 'Paid', 'Rica Santos')
]

export const usePaymentStore = defineStore('payments', {
  state: () => ({
    items: seed(),
    activity: [] as Activity[],
    changedId: ''
  }),
  actions: {
    log(text: string) {
      this.activity.unshift({ id: String(Date.now()), at: new Date().toISOString(), text })
      this.activity = this.activity.slice(0, 50)
    },
    add(d: Omit<Payment, 'id' | 'commission' | 'status'> & { by: string }) {
      const n = Math.max(0, ...this.items.map(p => Number(p.id.slice(4)))) + 1
      const { by, ...rest } = d
      const p: Payment = { ...rest, id: 'PAY-' + String(n).padStart(4, '0'), commission: commissionOf(d.amount), status: 'Pending' }
      this.items.unshift(p)
      this.log(`${by} recorded ${p.id} (${p.type}, ${p.agent})`)
      useNotifyStore().push({ type: 'payment', title: 'Payment recorded', body: `${p.id} for ${p.clientName} is waiting for approval.`, link: `/admin?tab=payments&focus=${p.id}`, to: 'admin' })
      return p
    },
    setStatus(id: string, status: PayStatus, by: string) {
      const p = this.items.find(i => i.id === id)
      if (!p || p.status === status) return
      p.status = status
      this.changedId = id
      this.log(`${by} changed ${id} to ${status}`)
      useNotifyStore().push({ type: 'payment', title: `Payment marked ${status}`, body: `${id} for ${p.clientName} is now ${status}.`, link: `/agent?tab=deals&focus=${id}`, to: 'name:' + p.agent })
    }
  }
})
