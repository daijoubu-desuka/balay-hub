import { defineStore } from 'pinia'

// `to`: 'admin' | 'agent' | 'client' (whole role) or 'name:<full name>' (one person)
export interface Notice { id: string; type: string; title: string; body: string; createdAt: string; read: boolean; link: string; to: string }

const seed = (): Notice[] => [] // starts empty: no pre-filled demo notices

export const useNotifyStore = defineStore('notifications', {
  state: () => ({
    items: seed()
  }),
  getters: {
    forUser: s => (u: { role: string; name: string } | null) =>
      u ? s.items.filter(n => n.to === u.role || n.to === 'name:' + u.name).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []
  },
  actions: {
    push(n: Omit<Notice, 'id' | 'createdAt' | 'read'>) {
      this.items.unshift({ ...n, id: 'n-' + Date.now() + Math.random().toString(36).slice(2, 5), createdAt: new Date().toISOString(), read: false })
      this.items = this.items.slice(0, 60)
    },
    read(id: string) { const n = this.items.find(i => i.id === id); if (n) n.read = true },
    readAll(u: { role: string; name: string }) { this.forUser(u).forEach(n => (n.read = true)) }
  }
})
