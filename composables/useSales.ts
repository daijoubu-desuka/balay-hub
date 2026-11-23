import type { Payment } from '~/stores/payments'

const ymd = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const mondayOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7))
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

// Paid-sales totals per week (last 8, weeks start Monday) or per month (last 6). The last bucket is "now".
export function salesBuckets(sales: Payment[], mode: 'week' | 'month', now = new Date()) {
  const out: { label: string; value: number }[] = []
  const sum = (f: (p: Payment) => boolean) => sales.filter(f).reduce((n, p) => n + p.amount, 0)
  if (mode === 'week') {
    const m0 = mondayOf(now)
    for (let i = 7; i >= 0; i--) {
      const s = new Date(m0.getFullYear(), m0.getMonth(), m0.getDate() - i * 7)
      out.push({ label: s.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }), value: sum(p => key(mondayOf(ymd(p.date))) === key(s)) })
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const s = new Date(now.getFullYear(), now.getMonth() - i, 1)
      out.push({ label: s.toLocaleDateString('en-PH', { month: 'short', year: '2-digit' }), value: sum(p => { const d = ymd(p.date); return d.getFullYear() === s.getFullYear() && d.getMonth() === s.getMonth() }) })
    }
  }
  return out
}

export const paidSales = (list: Payment[]) => list.filter(p => p.type === 'Sale' && p.status === 'Paid')
