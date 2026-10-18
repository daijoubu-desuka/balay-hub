<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = usePropertyStore()
const auth = useAuthStore()
const ui = useUiStore()
await useAsyncData('properties', async () => { await store.load(); return true })

const p = computed(() => store.byId(String(route.params.id)))
const active = ref(0)
const bad = reactive<Record<number, boolean>>({})
const mainImg = ref<HTMLImageElement | null>(null)
onMounted(() => {
  if (mainImg.value && mainImg.value.complete && mainImg.value.naturalWidth === 0) bad[active.value] = true
})
useHead({ title: computed(() => (p.value ? `${p.value.title} | BahayHub Butuan` : 'Property not found | BahayHub')) })
watch(() => route.params.id, () => { active.value = 0 })

const saved = computed(() => !!p.value && store.saved.includes(p.value.id))
function toggleSave() {
  if (!p.value) return
  if (!auth.isLoggedIn) {
    ui.toast('Please log in to save homes.')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  ui.toast(store.toggleSaved(p.value.id) ? 'Saved to your homes.' : 'Removed from saved homes.', 'success')
}
async function share() {
  try { await navigator.clipboard.writeText(location.href); ui.toast('Link copied.', 'success') } catch { ui.toast('Copy the link from your address bar.') }
}
</script>

<template>
  <div class="wrap" style="padding-top:20px;padding-bottom:30px">
    <div v-if="!p" class="empty" style="margin:40px 0">
      <Icon name="empty" /><h2>We couldn’t find that property</h2>
      <p style="color:var(--muted)">It may have been removed or the link is incorrect.</p>
      <NuxtLink to="/" class="btn btn-navy">Back to listings</NuxtLink>
    </div>
    <template v-else>
      <nav class="crumbs" aria-label="Breadcrumb"><NuxtLink to="/">Browse properties</NuxtLink><span>/</span><span>{{ p.title }}</span></nav>
      <div class="detail">
        <div style="min-width:0">
          <div class="gallery">
            <div class="main">
              <Transition name="fade" mode="out-in">
                <img v-if="!bad[active]" ref="mainImg" :key="active" :src="p.images[active]" :alt="`${p.title} photo ${active + 1}`" @error="bad[active] = true" />
                <div v-else :key="'b' + active" class="img-fallback"><Icon name="home" /></div>
              </Transition>
              <div class="badges"><span class="tagb" :class="p.listing">{{ p.listing === 'sale' ? 'For Sale' : 'For Rent' }}</span><span class="tagb" :class="p.status === 'available' ? 'ok' : 'warn'"><i />{{ p.status }}</span></div>
            </div>
            <div class="thumbs">
              <button v-for="(img, i) in p.images" :key="img" :aria-current="active === i" :aria-label="`Show photo ${i + 1}`" @click="active = i"><img :src="img" alt="" loading="lazy" /></button>
            </div>
          </div>

          <div class="panel" style="margin-top:20px">
            <p class="eyebrow">{{ typeLabel[p.type] }}</p>
            <h1>{{ p.title }}</h1>
            <p class="loc"><Icon name="pin" />{{ p.location }}, Butuan City, Agusan del Norte</p>
            <p class="big-price">{{ peso(p.price) }}<small v-if="p.listing === 'rent'" style="font-size:15px;font-weight:500;color:var(--muted)"> / month</small></p>
            <div class="facts">
              <div v-if="p.type !== 'commercial'" class="fact"><small>Bedrooms</small><b>{{ p.beds === 0 ? 'Studio' : p.beds }}</b></div>
              <div class="fact"><small>Bathrooms</small><b>{{ p.baths }}</b></div>
              <div class="fact"><small>Floor area</small><b>{{ p.sqm }} sqm</b></div>
              <div v-if="p.lot" class="fact"><small>Lot area</small><b>{{ p.lot }} sqm</b></div>
              <div class="fact"><small>Stage</small><b style="font-size:14px">{{ stageLabel[p.stage].replace(/ \(.*\)/, '') }}</b></div>
              <div v-if="p.hoa" class="fact"><small>HOA dues</small><b>₱{{ p.hoa }} / sqm</b></div>
            </div>
            <h3 style="font-size:17px;margin-bottom:8px">About this property</h3>
            <p style="line-height:1.7">{{ p.description }}</p>
            <div class="feat"><span v-for="f in p.features" :key="f">{{ f }}</span></div>
            <div style="display:flex;gap:10px;margin-top:22px;flex-wrap:wrap">
              <button class="btn" :class="saved ? 'btn-orange' : 'btn-ghost'" @click="toggleSave"><Icon name="heart" :style="saved ? 'fill:currentColor' : ''" /> {{ saved ? 'Saved' : 'Save home' }}</button>
              <button class="btn btn-ghost" @click="share">Copy link</button>
            </div>
          </div>
        </div>

        <aside class="aside">
          <div class="panel">
            <div class="agent" style="margin-bottom:14px">
              <span class="avatar" style="width:44px;height:44px;font-size:14px" aria-hidden="true">{{ p.agent.initials }}</span>
              <div><b style="font-size:15px">{{ p.agent.name }}</b><small>Contact unverified</small></div>
            </div>
            <h2 style="font-size:19px;margin-bottom:14px">{{ p.cta === 'Join Waitlist' ? 'Join the waitlist' : 'Request a viewing' }}</h2>
            <InquiryForm :property-id="p.id" :title="p.title" />
          </div>
          <div class="note-box"><Icon name="shield" /><div><b>Butuan City listings</b>Listing details only. Titles, contacts, and agent credentials are not verified.</div></div>
        </aside>
      </div>
    </template>
  </div>
</template>
