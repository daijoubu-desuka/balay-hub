<script setup lang="ts">
// Profile card for every role: change or remove the photo, phone, title and a short "about".
const auth = useAuthStore()
const profiles = useProfileStore()
const ui = useUiStore()
const face = useFace()

const p = computed(() => profiles.of(auth.user!.id))
const form = reactive({ photo: '', phone: '', title: '', about: '' })
const reset = () => Object.assign(form, { photo: p.value.photo, phone: p.value.phone, title: p.value.title, about: p.value.about })
reset()

const touched = ref(false)
const photoErr = ref('')
const fileIn = ref<HTMLInputElement | null>(null)
const shown = computed(() => form.photo || (p.value.photo ? '' : face(auth.user!.id))) // demo portrait until they pick one
const errors = computed(() => {
  const e: Record<string, string> = {}
  if (form.phone && !isPhone(form.phone)) e.phone = 'Use a PH mobile number, for example 09171234567.'
  if (form.title.length > 60) e.title = 'Keep the title under 60 characters.'
  if (form.about.length > 280) e.about = 'Keep it under 280 characters.'
  return e
})
const dirty = computed(() => form.photo !== p.value.photo || form.phone !== p.value.phone || form.title !== p.value.title || form.about !== p.value.about)

async function pick(e: Event) {
  photoErr.value = ''
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { photoErr.value = 'Use a JPG, PNG or WebP image.'; return }
  if (f.size > 5 * 1024 * 1024) { photoErr.value = 'The photo must be 5 MB or smaller.'; return }
  form.photo = await toThumb(f, 320)
}
function save() {
  touched.value = true
  if (Object.keys(errors.value).length) { ui.toast('Please fix the highlighted fields.', 'error'); return }
  // the "Profile updated" notice (and its toast) comes from the store
  if (!profiles.save(auth.user!, { ...form, phone: form.phone.replace(/[\s-]/g, '') })) ui.toast('Nothing to save yet.')
  touched.value = false
}
const roleLabel = { client: 'Client', agent: 'Agent', admin: 'Administrator' }
</script>

<template>
  <section v-if="auth.user" class="ws-card x-profile">
    <div class="x-profile-top">
      <div class="x-profile-photo">
        <img v-if="shown" :src="shown" :alt="`Profile photo of ${auth.user.name}`" />
        <span v-else aria-hidden="true">{{ auth.initials }}</span>
      </div>
      <div>
        <p class="ws-card-eyebrow">{{ roleLabel[auth.user.role] }} profile</p>
        <h3 class="ws-card-title" style="font-size:20px">{{ auth.user.name }}</h3>
        <p class="x-muted">{{ auth.user.email }}<template v-if="p.updatedAt"> · updated {{ fmtDate(p.updatedAt) }}</template></p>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button type="button" class="btn btn-soft btn-sm" @click="fileIn?.click()">{{ shown ? 'Change photo' : 'Add photo' }}</button>
          <button v-if="form.photo" type="button" class="btn btn-ghost btn-sm" @click="form.photo = ''">Remove photo</button>
          <input ref="fileIn" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" aria-label="Choose a profile photo" @change="pick" />
        </div>
        <p v-if="photoErr" class="err" role="alert">{{ photoErr }}</p>
      </div>
    </div>

    <form novalidate class="x-grid2" style="margin-top:18px" @submit.prevent="save">
      <div class="form-row"><label for="pf-phone">Mobile number</label>
        <input id="pf-phone" v-model="form.phone" class="input" inputmode="tel" placeholder="09171234567" :aria-invalid="touched && !!errors.phone" />
        <p v-if="touched && errors.phone" class="err" role="alert">{{ errors.phone }}</p></div>
      <div class="form-row"><label for="pf-title">{{ auth.user.role === 'client' ? 'What are you looking for?' : 'Title' }}</label>
        <input id="pf-title" v-model="form.title" class="input" :placeholder="auth.user.role === 'client' ? 'e.g. 3-bedroom house in Libertad' : auth.user.role === 'agent' ? 'e.g. Licensed broker, Libertad' : 'e.g. Platform administrator'" :aria-invalid="touched && !!errors.title" />
        <p v-if="touched && errors.title" class="err" role="alert">{{ errors.title }}</p></div>
      <div class="form-row x-span"><label for="pf-about">About</label>
        <textarea id="pf-about" v-model="form.about" class="input" rows="3" style="height:auto;padding:10px 14px" :aria-invalid="touched && !!errors.about" />
        <small class="x-muted">{{ form.about.length }}/280</small>
        <p v-if="touched && errors.about" class="err" role="alert">{{ errors.about }}</p></div>
      <p class="x-muted x-span" style="font-size:12px">Your name and email can’t be changed here. Photos are kept in this browser only.</p>
      <div class="x-span" style="display:flex;gap:10px">
        <button class="btn btn-orange" :disabled="!dirty">Save profile</button>
        <button v-if="dirty" type="button" class="btn btn-ghost" @click="reset">Discard changes</button>
      </div>
    </form>
  </section>
</template>
