// Notification links can carry ?focus=<id>. The matching row (data-focus="<id>") is scrolled into
// view and briefly highlighted. Rows may appear a moment later (tab fade, skeleton), so retry briefly.
export function useFocusRow() {
  const route = useRoute()
  let timer: ReturnType<typeof setTimeout> | undefined

  function find(id: string, tries = 0) {
    const el = document.querySelector<HTMLElement>(`[data-focus="${CSS.escape(id)}"]`)
    if (!el) { if (tries < 40) timer = setTimeout(() => find(id, tries + 1), 60); return }
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
    el.classList.remove('focus-flash')
    void el.offsetWidth // restart the highlight if the same row is focused again
    el.classList.add('focus-flash')
    setTimeout(() => el.classList.remove('focus-flash'), 2400)
  }
  const run = () => {
    clearTimeout(timer)
    const id = route.query.focus
    if (typeof id === 'string' && id) find(id)
  }
  onMounted(run)
  watch(() => route.query.focus, run)
  onBeforeUnmount(() => clearTimeout(timer))
}

// Current account name for a user id (records keep a copy of the name from when they were made).
export const nameOf = (id: string, fallback = '') => useAuthStore().users.find(u => u.id === id)?.name || fallback
