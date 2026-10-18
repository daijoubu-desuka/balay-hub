import { defineStore } from 'pinia'

export interface Toast { id: number; message: string; type: 'info' | 'success' | 'error' }

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [] as Toast[],
    mobileNav: false,
    filterDrawer: false,
    brokerOpen: false,
    splashDone: false
  }),
  actions: {
    toast(message: string, type: Toast['type'] = 'info') {
      const id = Date.now() + Math.random()
      this.toasts.push({ id, message, type })
      setTimeout(() => this.dismiss(id), 3600)
    },
    dismiss(id: number) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    }
  }
})
