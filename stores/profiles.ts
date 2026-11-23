import { defineStore } from 'pinia'
import type { Role } from '~/stores/auth'

// Editable profile details per user (photo, phone, about). Name and email stay fixed:
// payments and notifications are tied to the name, so only an admin process should change them.
export interface Profile { photo: string; phone: string; about: string; title: string; updatedAt: string }
const blank = (): Profile => ({ photo: '', phone: '', about: '', title: '', updatedAt: '' })
const LINK: Record<Role, string> = { client: '/account', agent: '/agent?tab=profile', admin: '/admin?tab=profile' }

export const useProfileStore = defineStore('profiles', {
  state: () => ({
    items: {} as Record<string, Profile>
  }),
  getters: {
    of: s => (id: string): Profile => s.items[id] ?? blank()
  },
  actions: {
    save(user: { id: string; name: string; role: Role }, next: Omit<Profile, 'updatedAt'>) {
      const prev = this.of(user.id)
      const changed: string[] = []
      if (next.photo !== prev.photo) changed.push(!next.photo ? 'photo removed' : prev.photo ? 'photo changed' : 'photo added')
      if (next.phone !== prev.phone) changed.push('phone number')
      if (next.title !== prev.title) changed.push('title')
      if (next.about !== prev.about) changed.push('about section')
      if (!changed.length) return false
      this.items[user.id] = { ...next, updatedAt: new Date().toISOString() }
      const list = changed.join(', ')
      const notify = useNotifyStore()
      // a notice for the person (also shown as a toast) ...
      notify.push({ type: 'profile', title: 'Profile updated', body: `Saved: ${list}.`, link: LINK[user.role], to: 'name:' + user.name })
      // ... and for admins, when a client or agent changes what others see
      if (user.role !== 'admin') {
        notify.push({
          type: 'profile', title: `${user.role === 'agent' ? 'Agent' : 'Client'} profile changed`, body: `${user.name} updated: ${list}.`,
          link: `/admin?tab=verification&focus=${user.id}`, to: 'admin'
        })
      }
      return true
    }
  }
})
