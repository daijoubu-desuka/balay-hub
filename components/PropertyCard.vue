<script setup lang="ts">
import type { Property } from '~/stores/properties'

const p = defineProps<{ item: Property }>()
const store = usePropertyStore()
const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()

const failed = ref(false)
const imgEl = ref<HTMLImageElement | null>(null)
onMounted(() => {
  // the image may have failed before hydration attached the error handler
  if (imgEl.value && imgEl.value.complete && imgEl.value.naturalWidth === 0) failed.value = true
})
const pop = ref(false)
const isSaved = computed(() => store.saved.includes(p.item.id))

const iconFor = (f: string) => {
  const s = f.toLowerCase()
  if (s.includes('pool')) return 'pool'
  if (s.includes('slot') || s.includes('park') || s.includes('carport') || s.includes('garage')) return 'car'
  if (s.includes('smart') || s.includes('wi-fi')) return 'wifi'
  if (s.includes('zone')) return 'zone'
  if (s.includes('balcony')) return 'balcony'
  return 'check'
}

function toggle() {
  if (!auth.isLoggedIn) {
    ui.toast('Please log in to save homes.', 'info')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  const now = store.toggleSaved(p.item.id)
  pop.value = true
  setTimeout(() => (pop.value = false), 400)
  ui.toast(now ? 'Saved to your homes.' : 'Removed from saved homes.', now ? 'success' : 'info')
}
</script>

<template>
  <article class="card">
    <div class="card-media">
      <NuxtLink :to="`/property/${item.id}`" :aria-label="`View ${item.title}`" style="display:block;width:100%;height:100%">
        <img v-if="!failed" ref="imgEl" :src="item.images[0]" :alt="`${item.title} in ${item.location}, Butuan City`" loading="lazy" @error="failed = true" />
        <div v-else class="img-fallback"><Icon name="home" /></div>
      </NuxtLink>
      <div class="badges">
        <span class="tagb" :class="item.listing">{{ item.listing === 'sale' ? 'For Sale' : 'For Rent' }}</span>
        <span class="tagb" :class="item.status === 'available' ? 'ok' : 'warn'"><i />{{ item.status }}</span>
      </div>
      <button class="heart" :class="{ pop }" :aria-pressed="isSaved" :aria-label="(isSaved ? 'Remove ' : 'Save ') + item.title" @click="toggle">
        <Icon name="heart" :style="isSaved ? 'fill:currentColor' : ''" />
      </button>
      <span class="media-label" :class="{ orange: item.listing === 'rent' }">{{ item.badge }}</span>
    </div>
    <div class="card-body">
      <div>
        <div class="price-row">
          <span class="price">{{ peso(item.price) }}<small v-if="item.listing === 'rent'"> / mo</small></span>
          <span class="price-note">{{ item.tag }}</span>
        </div>
        <NuxtLink :to="`/property/${item.id}`"><h3 class="card-title" style="margin-top:8px">{{ item.title }}</h3></NuxtLink>
        <p class="loc"><Icon name="pin" />{{ item.location }}, Butuan City</p>
      </div>
      <div class="specs">
        <span v-if="item.type !== 'commercial'" class="spec"><Icon name="bed" />{{ item.beds === 0 ? 'Studio' : item.beds + (item.beds === 1 ? ' Bed' : ' Beds') }}</span>
        <span class="spec"><Icon name="bath" />{{ item.baths }} {{ item.baths === 1 ? 'Bath' : 'Baths' }}</span>
        <span class="spec"><Icon name="area" />{{ item.sqm }} sqm</span>
        <span v-if="item.features[0]" class="spec"><Icon :name="iconFor(item.features[0])" />{{ item.features[0] }}</span>
      </div>
      <div class="card-foot">
        <div class="agent">
          <span class="avatar" aria-hidden="true">{{ item.agent.initials }}</span>
          <div><b>{{ item.agent.name }}</b><small>Contact unverified</small></div>
        </div>
        <NuxtLink :to="`/property/${item.id}`" class="btn btn-sm" :class="item.cta ? 'btn-soft' : 'btn-navy'">{{ item.cta || 'View Details' }}</NuxtLink>
      </div>
    </div>
  </article>
</template>
