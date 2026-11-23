// ONE place for the commission rule (10% of sale price, or monthly rent x lease months)
export const COMMISSION_RATE = 0.10
export const commissionOf = (amount: number) => Math.round(amount * COMMISSION_RATE * 100) / 100
export const pesoC = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const maskPrc = (n: string) => 'PRC •••' + n.slice(-4)
export const prcLabel = (n: string) => 'PRC ' + n
export const fmtDate = (s: string) => new Date(s.length === 10 ? s + 'T00:00:00' : s).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
export const fmtMonth = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

import type { Payment } from '~/stores/payments'
const round2 = (n: number) => Math.round(n * 100) / 100
export function totals(list: Payment[], type?: 'Sale' | 'Rent') {
  const l = type ? list.filter(p => p.type === type) : list
  const paid = l.filter(p => p.status === 'Paid')
  const pend = l.filter(p => p.status === 'Pending')
  const sum = (a: Payment[], k: 'amount' | 'commission') => round2(a.reduce((n, p) => n + p[k], 0))
  return {
    count: l.length, paidAmount: sum(paid, 'amount'), earned: sum(paid, 'commission'),
    pendingAmount: sum(pend, 'amount'), pendingCommission: sum(pend, 'commission')
  }
}
