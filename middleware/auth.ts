export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  if (!auth.user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
