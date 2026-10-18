export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  const props = usePropertyStore()
  props.hydrateLocal()
  await auth.hydrate()
})
