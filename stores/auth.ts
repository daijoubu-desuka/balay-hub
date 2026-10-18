import { defineStore } from 'pinia'

export type Role = 'client' | 'agent' | 'admin'
export interface User { id: string; name: string; email: string; role: Role }
interface StoredUser extends User { hash: string }

const SESSION_KEY = 'bahayhub_session'
const USERS_KEY = 'bahayhub_users'

// Demo accounts for the midterm (frontend only, no backend yet)
const DEMO = [
  { id: 'u-client', name: 'Client Demo', email: 'client@bahayhub.test', password: 'client123', role: 'client' as Role },
  { id: 'u-agent', name: 'Agent Demo', email: 'agent@bahayhub.test', password: 'agent123', role: 'agent' as Role },
  { id: 'u-admin', name: 'Admin Demo', email: 'admin@bahayhub.test', password: 'admin123', role: 'admin' as Role }
]

async function hash(email: string, password: string) {
  const text = `${email.toLowerCase()}::${password}`
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return btoa(text)
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    users: [] as StoredUser[],
    ready: false
  }),
  getters: {
    isLoggedIn: s => !!s.user,
    initials: s => (s.user ? s.user.name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() : '')
  },
  actions: {
    async hydrate() {
      if (this.ready) return
      try {
        const raw = localStorage.getItem(USERS_KEY)
        this.users = raw ? JSON.parse(raw) : []
        const seeded: StoredUser[] = []
        for (const d of DEMO) {
          if (!this.users.find(u => u.email === d.email)) {
            seeded.push({ id: d.id, name: d.name, email: d.email, role: d.role, hash: await hash(d.email, d.password) })
          }
        }
        if (seeded.length) {
          this.users.push(...seeded)
          localStorage.setItem(USERS_KEY, JSON.stringify(this.users))
        }
        // Session uses sessionStorage (clears on tab/browser close)
        const s = sessionStorage.getItem(SESSION_KEY)
        if (s) this.user = JSON.parse(s)
      } catch { /* storage unavailable */ }
      this.ready = true
    },
    async login(email: string, password: string, role: Role) {
      await this.hydrate()
      const found = this.users.find(u => u.email === email.trim().toLowerCase())
      if (!found) return { ok: false, error: 'No account found with that email.' }
      if (found.hash !== await hash(found.email, password)) return { ok: false, error: 'Incorrect password. Please try again.' }
      if (found.role !== role) return { ok: false, error: `This account is a ${found.role} account. Use the ${found.role} sign-in tab.` }
      this.setSession(found)
      return { ok: true }
    },
    async signup(data: { name: string; email: string; password: string; role: Role }) {
      await this.hydrate()
      const email = data.email.trim().toLowerCase()
      if (this.users.find(u => u.email === email)) return { ok: false, error: 'An account with this email already exists.' }
      const user: StoredUser = { id: 'u-' + Date.now(), name: data.name.trim(), email, role: data.role, hash: await hash(email, data.password) }
      this.users.push(user)
      localStorage.setItem(USERS_KEY, JSON.stringify(this.users))
      // Do NOT auto-login — user must sign in manually after registration
      return { ok: true }
    },
    setSession(u: StoredUser | User) {
      this.user = { id: u.id, name: u.name, email: u.email, role: u.role }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.user))
    },
    logout() {
      this.user = null
      sessionStorage.removeItem(SESSION_KEY)
    }
  }
})
