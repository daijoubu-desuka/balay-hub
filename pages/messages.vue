<script setup lang="ts">
definePageMeta({ middleware: 'auth', ssr: false })
useHead({ title: 'Messages | BahayHub Butuan' })
const auth = useAuthStore()
const router = useRouter()
// agents and admins use the Messages tab in their workspace
watch(() => auth.user, u => { if (u && u.role !== 'client') router.replace(`/${u.role}?tab=messages`) }, { immediate: true })
</script>

<template>
  <div v-if="auth.user?.role === 'client'" class="wrap" style="padding-top:24px;padding-bottom:40px">
    <p class="eyebrow">Messages</p>
    <h1 style="font-size:clamp(26px,4vw,38px);margin:8px 0 18px">Talk to agents and support.</h1>
    <MessagesPanel />
  </div>
</template>
