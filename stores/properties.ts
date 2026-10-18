import { defineStore } from 'pinia'

export interface Property {
  id: string; title: string; listing: 'sale' | 'rent'; type: string; price: number
  location: string; beds: number; baths: number; sqm: number; lot: number | null
  stage: string; status: 'available' | 'reserved'; hoa: number; development: boolean
  badge: string; tag: string; note: string | null; features: string[]
  agent: { name: string; initials: string }; images: string[]; description: string; cta: string | null
}
export interface Inquiry { id: number; propertyId: string; title: string; name: string; email: string; phone: string; date: string; message: string; sent: string }

export const BOUNDS = {
  sale: { min: 1_000_000, max: 100_000_000, step: 500_000 },
  rent: { min: 5_000, max: 200_000, step: 1_000 }
}
export const LOCATIONS = ['Baan Riverside', 'Libertad', 'Villa Kananga', 'Bancasi', 'J.C. Aquino Avenue', 'Ampayon', 'Taguibo', 'Langihan', 'Doongan', 'Ong Yiu', 'Agao']

const freshFilters = (mode: 'sale' | 'rent' = 'sale') => ({
  mode,
  query: '',
  location: 'all',
  type: 'all',
  minPrice: BOUNDS[mode].min,
  maxPrice: BOUNDS[mode].max,
  beds: 'any',
  baths: 0,
  minSqm: null as number | null,
  maxSqm: null as number | null,
  stages: [] as string[],
  hoaMax: 0
})

export const SAVED_KEY = 'bahayhub_saved'

export const usePropertyStore = defineStore('properties', {
  state: () => ({
    items: [] as Property[],
    loaded: false,
    loading: false,
    error: '' as string,
    filters: freshFilters(),
    preset: { mode: 'sale' as 'sale' | 'rent', type: 'all', developmentOnly: false },
    sort: 'price-desc',
    view: 'grid' as 'grid' | 'list',
    page: 1,
    pageSize: 6,
    saved: [] as string[],
    inquiries: [] as Inquiry[]
  }),
  getters: {
    bounds: s => BOUNDS[s.filters.mode],
    byId: s => (id: string) => s.items.find(i => i.id === id),
    chips(s): { key: string; label: string }[] {
      const f = s.filters
      const b = BOUNDS[f.mode]
      const out: { key: string; label: string }[] = []
      if (f.query.trim()) out.push({ key: 'query', label: `“${f.query.trim()}”` })
      if (f.location !== 'all') out.push({ key: 'location', label: f.location })
      if (f.type !== 'all') out.push({ key: 'type', label: typeLabel[f.type] })
      if (f.minPrice !== b.min || f.maxPrice !== b.max) out.push({ key: 'price', label: `${peso(f.minPrice)} – ${peso(f.maxPrice)}${f.maxPrice === b.max ? '+' : ''}` })
      if (f.beds !== 'any') out.push({ key: 'beds', label: f.beds === 'studio' ? 'Studio' : f.beds === '4' ? '4+ bedrooms' : `${f.beds} bedroom${f.beds === '1' ? '' : 's'}` })
      if (f.baths) out.push({ key: 'baths', label: `${f.baths}+ bathrooms` })
      if (f.minSqm !== null || f.maxSqm !== null) out.push({ key: 'sqm', label: `${f.minSqm ?? 0}–${f.maxSqm ?? '∞'} sqm` })
      f.stages.forEach(st => out.push({ key: 'stage:' + st, label: stageLabel[st].replace(/ \(.*\)/, '') }))
      if (f.hoaMax) out.push({ key: 'hoa', label: `HOA ≤ ₱${f.hoaMax}/sqm` })
      return out
    },
    filtered(s): Property[] {
      const f = s.filters
      const q = f.query.trim().toLowerCase()
      let list = s.items.filter(p => {
        if (p.listing !== f.mode) return false
        if (s.preset.developmentOnly && !p.development) return false
        if (f.location !== 'all' && p.location !== f.location) return false
        if (f.type !== 'all' && p.type !== f.type) return false
        const b = BOUNDS[f.mode]
        if (p.price < f.minPrice) return false
        if (f.maxPrice < b.max && p.price > f.maxPrice) return false
        if (f.beds === 'studio' && p.beds !== 0) return false
        if (f.beds !== 'any' && f.beds !== 'studio') {
          const n = Number(f.beds)
          if (n === 4 ? p.beds < 4 : p.beds !== n) return false
        }
        if (f.baths && p.baths < f.baths) return false
        if (f.minSqm !== null && p.sqm < f.minSqm) return false
        if (f.maxSqm !== null && p.sqm > f.maxSqm) return false
        if (f.stages.length && !f.stages.includes(p.stage)) return false
        if (f.hoaMax && p.hoa > f.hoaMax) return false
        if (q && !(`${p.title} ${p.location} ${p.type} ${typeLabel[p.type]} ${p.features.join(' ')} butuan`).toLowerCase().includes(q)) return false
        return true
      })
      const sorters: Record<string, (a: Property, b: Property) => number> = {
        'price-desc': (a, b) => b.price - a.price,
        'price-asc': (a, b) => a.price - b.price,
        'area-desc': (a, b) => b.sqm - a.sqm,
        newest: (a, b) => s.items.indexOf(b) - s.items.indexOf(a)
      }
      return list.sort(sorters[s.sort] || sorters['price-desc'])
    },
    pageCount(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)) },
    paged(): Property[] {
      const start = (this.page - 1) * this.pageSize
      return this.filtered.slice(start, start + this.pageSize)
    },
    savedItems: s => s.items.filter(i => s.saved.includes(i.id))
  },
  actions: {
    async load() {
      if (this.loaded || this.loading) return
      this.loading = true
      this.error = ''
      const MAX_RETRIES = 3
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          this.items = await $fetch<Property[]>('/data/properties.json')
          this.loaded = true
          this.error = ''
          break
        } catch (e) {
          if (attempt < MAX_RETRIES) {
            // Wait before retrying (600ms, 1200ms)
            await new Promise(r => setTimeout(r, attempt * 600))
          } else {
            this.error = 'We could not load the property list. Please check your connection and try again.'
          }
        }
      }
      this.loading = false
    },
    retry() { this.loaded = false; return this.load() },
    hydrateLocal() {
      try {
        this.saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
        this.inquiries = JSON.parse(localStorage.getItem('bahayhub_inquiries') || '[]')
      } catch { /* ignore */ }
    },
    applyPreset(p: { mode?: 'sale' | 'rent'; type?: string; developmentOnly?: boolean }) {
      this.preset = { mode: p.mode || 'sale', type: p.type || 'all', developmentOnly: !!p.developmentOnly }
      this.resetFilters()
    },
    resetFilters() {
      this.filters = freshFilters(this.preset.mode)
      this.filters.type = this.preset.type
      this.page = 1
    },
    setMode(mode: 'sale' | 'rent') {
      this.filters.mode = mode
      this.filters.minPrice = BOUNDS[mode].min
      this.filters.maxPrice = BOUNDS[mode].max
      this.filters.hoaMax = 0
      this.page = 1
    },
    removeChip(key: string) {
      const f = this.filters
      if (key === 'query') f.query = ''
      else if (key === 'location') f.location = 'all'
      else if (key === 'type') f.type = 'all'
      else if (key === 'price') { f.minPrice = BOUNDS[f.mode].min; f.maxPrice = BOUNDS[f.mode].max }
      else if (key === 'beds') f.beds = 'any'
      else if (key === 'baths') f.baths = 0
      else if (key === 'sqm') { f.minSqm = null; f.maxSqm = null }
      else if (key === 'hoa') f.hoaMax = 0
      else if (key.startsWith('stage:')) f.stages = f.stages.filter(s => s !== key.slice(6))
      this.page = 1
    },
    toggleSaved(id: string) {
      this.saved = this.saved.includes(id) ? this.saved.filter(s => s !== id) : [...this.saved, id]
      localStorage.setItem(SAVED_KEY, JSON.stringify(this.saved))
      return this.saved.includes(id)
    },
    addInquiry(i: Omit<Inquiry, 'id' | 'sent'>) {
      this.inquiries.unshift({ ...i, id: Date.now(), sent: new Date().toISOString() })
      localStorage.setItem('bahayhub_inquiries', JSON.stringify(this.inquiries))
    },
    removeInquiry(id: number) {
      this.inquiries = this.inquiries.filter(i => i.id !== id)
      localStorage.setItem('bahayhub_inquiries', JSON.stringify(this.inquiries))
    }
  }
})
