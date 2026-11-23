import { defineStore } from 'pinia'

export interface Toast { id: number; message: string; type: 'info' | 'success' | 'error'; link?: string; noticeId?: string }

const timers = new Map<number, ReturnType<typeof setTimeout>>()

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [] as Toast[],
    mobileNav: false,
    filterDrawer: false,
    brokerOpen: false,
    splashDone: false
  }),
  actions: {
    toast(message: string, type: Toast['type'] = 'info', link?: string, noticeId?: string) {
      const id = Date.now() + Math.random()
      this.toasts.push({ id, message, type, link, noticeId })
      this.release(id)
    },
    hold(id: number) { clearTimeout(timers.get(id)) }, // pause auto-dismiss while hovered
    release(id: number) { timers.set(id, setTimeout(() => this.dismiss(id), 5000)) },
    dismiss(id: number) {
      clearTimeout(timers.get(id))
      this.toasts = this.toasts.filter(t => t.id !== id)
    }
  }
})
