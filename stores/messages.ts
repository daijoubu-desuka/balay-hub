import { defineStore } from 'pinia'
import type { Role } from '~/stores/auth'

export interface Person { id: string; name: string; role: Role }
export interface Msg { id: string; from: string; text: string; at: string; read: boolean }
export interface Thread { id: string; a: Person; b: Person; topic: string; propertyId: string; propertyTitle: string; messages: Msg[] }

export const MAX_MSG = 500
// Clients cannot message other clients; agents only talk to clients and admins (different roles only).
export const canMessage = (x: Person, y: Person) => x.id !== y.id && x.role !== y.role

const ago = (m: number) => new Date(Date.now() - m * 60000).toISOString()
const client: Person = { id: 'u-client', name: 'Maria Santos', role: 'client' }
const agent: Person = { id: 'u-agent', name: 'Rica Santos', role: 'agent' }
const admin: Person = { id: 'u-admin', name: 'Andrea Villamor', role: 'admin' }
const m = (id: string, from: string, text: string, mins: number, read = true): Msg => ({ id, from, text, at: ago(mins), read })

export const useMessageStore = defineStore('messages', {
  state: () => ({
    threads: [
      { id: 't-1', a: client, b: agent, topic: 'Viewing request', propertyId: 'uptown-butuan-2br-condominium', propertyTitle: 'Uptown Butuan 2BR Condominium', messages: [
        m('m1', 'u-client', 'Hi! Is the 2BR unit still available this weekend?', 1500),
        m('m2', 'u-agent', 'Hello! Yes, it is. Would Saturday work for a viewing?', 1480),
        m('m3', 'u-client', 'Saturday morning is great. What time?', 60, false)
      ] },
      { id: 't-2', a: client, b: admin, topic: 'Support', propertyId: '', propertyTitle: '', messages: [
        m('m4', 'u-admin', 'Welcome to BahayHub! Message us here if you need help.', 3000)
      ] },
      { id: 't-3', a: agent, b: admin, topic: 'Listing review', propertyId: '', propertyTitle: '', messages: [
        m('m5', 'u-agent', 'Could you review my new draft listing in Libertad?', 400),
        m('m6', 'u-admin', 'Sure, I will check it today.', 380, false)
      ] }
    ] as Thread[],
    typing: {} as Record<string, boolean> // in-memory only, not persisted
  }),
  getters: {
    mine: s => (me: Person | null) => me
      ? s.threads.filter(t => t.a.id === me.id || t.b.id === me.id)
          .sort((x, y) => (y.messages.at(-1)?.at ?? '').localeCompare(x.messages.at(-1)?.at ?? ''))
      : [],
    unreadIn: () => (t: Thread, meId: string) => t.messages.filter(x => x.from !== meId && !x.read).length,
    unread: s => (me: Person | null) => me
      ? s.threads.filter(t => t.a.id === me.id || t.b.id === me.id).reduce((n, t) => n + t.messages.filter(x => x.from !== me.id && !x.read).length, 0)
      : 0
  },
  actions: {
    open(me: Person, other: Person, prop?: { id: string; title: string }) {
      if (!canMessage(me, other)) return ''
      const found = this.threads.find(t => [t.a.id, t.b.id].includes(me.id) && [t.a.id, t.b.id].includes(other.id) && t.propertyId === (prop?.id ?? ''))
      if (found) return found.id
      const id = 't-' + Date.now()
      this.threads.push({ id, a: me, b: other, topic: prop ? 'Property inquiry' : 'Conversation', propertyId: prop?.id ?? '', propertyTitle: prop?.title ?? '', messages: [] })
      return id
    },
    send(threadId: string, from: Person, raw: string) {
      const text = raw.trim()
      const t = this.threads.find(x => x.id === threadId)
      if (!t || !text || text.length > MAX_MSG) return false
      t.messages.push({ id: 'm-' + Date.now() + Math.random().toString(36).slice(2, 5), from: from.id, text, at: new Date().toISOString(), read: false })
      const to = t.a.id === from.id ? t.b : t.a
      const base = to.role === 'client' ? '/messages' : `/${to.role}?tab=messages`
      useNotifyStore().push({ type: 'message', title: `New message from ${from.name}`, body: text.slice(0, 80), link: `${base}${base.includes('?') ? '&' : '?'}t=${t.id}`, to: 'name:' + nameOf(to.id, to.name) })
      return true
    },
    markRead(threadId: string, meId: string) {
      this.threads.find(t => t.id === threadId)?.messages.forEach(x => { if (x.from !== meId) x.read = true })
    }
  }
})
