export const peso = (n: number) => '₱' + Math.round(n).toLocaleString('en-PH')

export const pesoShort = (n: number) => {
  if (n >= 1_000_000) return '₱' + +(n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '₱' + +(n / 1_000).toFixed(0) + 'k'
  return '₱' + n
}

export const typeLabel: Record<string, string> = {
  condominium: 'Condominium Suite',
  'house-lot': 'House & Lot',
  townhouse: 'Townhouse / Duplex',
  commercial: 'Commercial / Office'
}

export const stageLabel: Record<string, string> = {
  rfo: 'Ready For Occupancy (RFO)',
  'pre-selling': 'Pre-selling (2025 - 2028)',
  resale: 'Secondary / Resale Market'
}
