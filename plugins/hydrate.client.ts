export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  const props = usePropertyStore()
  await auth.hydrate()
  if (auth.user) props.hydrateLocal() // saved homes and requests belong to a signed-in account
})
