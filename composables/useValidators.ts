export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
export const isPhone = (v: string) => /^(\+?63|0)9\d{9}$/.test(v.replace(/[\s-]/g, ''))

export const passwordScore = (v: string) => {
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/\d/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return s
}

// Agent intake: every document is required except the optional ones. Demo only: just file names are kept.
export const PRC_DOCS = [
  { key: 'govId', label: 'Government-issued ID', hint: 'Passport, UMID, driver license or PhilSys', req: true },
  { key: 'resume', label: 'Resume / CV', hint: 'Shows your real estate experience', req: true },
  { key: 'nbi', label: 'NBI or police clearance', hint: 'Issued within the last 6 months', req: true },
  { key: 'photo', label: '2x2 photo', hint: 'Plain background, recent', req: true },
  { key: 'ptr', label: 'Professional Tax Receipt (PTR)', hint: 'For the current year', req: true },
  { key: 'cpd', label: 'CPD certificate', hint: 'Continuing professional development units', req: false },
  { key: 'org', label: 'Organization membership', hint: 'e.g. PAREB or REBAP, if you belong to one', req: false }
] as const
export type DocKey = typeof PRC_DOCS[number]['key']
export interface PrcForm {
  no: string; type: 'Real Estate Broker' | 'Salesperson'; expiry: string; file: File | null; consent: boolean
  years: string; areas: string; broker: string; tin: string; docs: Record<DocKey, File | null>
  fileUrl: string; photoUrl: string // small previews kept so the admin can see them
}
export const newPrcForm = (): PrcForm => ({
  no: '', type: 'Real Estate Broker', expiry: '', file: null, consent: false, years: '', areas: '', broker: '', tin: '', fileUrl: '', photoUrl: '',
  docs: { govId: null, resume: null, nbi: null, photo: null, ptr: null, cpd: null, org: null }
})
const fileErr = (f: File) => !['image/jpeg', 'image/png', 'application/pdf'].includes(f.type) ? 'Use a JPG, PNG or PDF file.' : f.size > 2 * 1024 * 1024 ? 'The file must be 2 MB or smaller.' : ''
export function prcErrors(f: PrcForm) {
  const e: Record<string, string> = {}
  if (!/^\d{7}$/.test(f.no)) e.no = 'The PRC license number has 7 digits.'
  if (!f.expiry || f.expiry <= new Date().toISOString().slice(0, 10)) e.expiry = 'The expiry date must be in the future.'
  if (!f.file) e.file = 'Upload a clear photo of the license (JPG, PNG or PDF).'
  else if (fileErr(f.file)) e.file = fileErr(f.file)
  if (!/^\d{1,2}$/.test(f.years)) e.years = 'Enter your years of experience (0 to 99).'
  if (f.areas.trim().length < 3) e.areas = 'Tell us which areas you serve.'
  if (f.type === 'Salesperson' && f.broker.trim().length < 3) e.broker = 'A salesperson must name the supervising broker.'
  if (!/^\d{9,12}$/.test(f.tin.replace(/[-\s]/g, ''))) e.tin = 'A TIN has 9 to 12 digits.'
  for (const d of PRC_DOCS) {
    const file = f.docs[d.key]
    if (!file && d.req) e[d.key] = `Upload your ${d.label.toLowerCase()}.`
    else if (file && fileErr(file)) e[d.key] = fileErr(file)
  }
  if (!f.consent) e.consent = 'Please confirm the consent box.'
  return e
}

// Which errors belong to which signup step / form part
export const PRC_INFO_KEYS = ['no', 'type', 'expiry', 'file', 'years', 'areas', 'broker', 'tin']
export const only = (e: Record<string, string>, keys: string[], inside = true) =>
  Object.fromEntries(Object.entries(e).filter(([k]) => keys.includes(k) === inside))

// Buyer identity check (demo: only file names are kept)
export const ID_TYPES = ['PhilSys National ID', "Driver's license", 'Passport', 'UMID', "Voter's ID", 'Postal ID']
export interface BuyerForm { phone: string; idType: string; idNumber: string; idPhoto: File | null; idPhotoUrl: string }
export const newBuyerForm = (): BuyerForm => ({ phone: '', idType: ID_TYPES[0], idNumber: '', idPhoto: null, idPhotoUrl: '' })
export function buyerErrors(f: BuyerForm) {
  const e: Record<string, string> = {}
  if (!isPhone(f.phone)) e.phone = 'Use a PH mobile number, for example 09171234567.'
  if (f.idNumber.replace(/[\s-]/g, '').length < 5) e.idNumber = 'Enter the number shown on your ID.'
  if (!f.idPhoto) e.idPhoto = 'Upload a clear photo of the front of your ID.'
  else if (fileErr(f.idPhoto)) e.idPhoto = fileErr(f.idPhoto)
  return e
}
