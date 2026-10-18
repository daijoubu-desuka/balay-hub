<script setup lang="ts">
const props = defineProps<{ propertyId: string; title: string; compact?: boolean }>()
const emit = defineEmits<{ sent: [] }>()
const store = usePropertyStore()
const auth = useAuthStore()
const ui = useUiStore()

const form = reactive({ name: '', email: '', phone: '', date: '', message: '' })
const touched = reactive<Record<string, boolean>>({})
const sending = ref(false)
const today = new Date().toISOString().slice(0, 10)

watch(() => auth.user, u => {
  if (u) { form.name ||= u.name; form.email ||= u.email }
}, { immediate: true })

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (form.name.trim().length < 2) e.name = 'Please enter your full name.'
  if (!isEmail(form.email)) e.email = 'Enter a valid email, for example name@email.com.'
  if (!isPhone(form.phone)) e.phone = 'Use a PH mobile number, for example 09171234567.'
  if (!form.date) e.date = 'Choose a preferred viewing date.'
  else if (form.date < today) e.date = 'The date cannot be in the past.'
  if (form.message.length > 300) e.message = 'Keep your message under 300 characters.'
  return e
})
const show = (k: string) => (touched[k] ? errors.value[k] : '')

async function submit() {
  Object.keys(form).forEach(k => (touched[k] = true))
  if (Object.keys(errors.value).length) {
    ui.toast('Please fix the highlighted fields.', 'error')
    return
  }
  sending.value = true
  await new Promise(r => setTimeout(r, 700)) // simulated request (no backend yet)
  store.addInquiry({ propertyId: props.propertyId, title: props.title, ...form, name: form.name.trim() })
  sending.value = false
  ui.toast('Viewing request saved in this browser.', 'success')
  form.phone = ''; form.date = ''; form.message = ''
  Object.keys(touched).forEach(k => (touched[k] = false))
  emit('sent')
}
</script>

<template>
  <form novalidate @submit.prevent="submit">
    <div class="form-row">
      <label :for="`n-${propertyId}`">Full name</label>
      <input :id="`n-${propertyId}`" v-model="form.name" class="input" autocomplete="name" :aria-invalid="!!show('name')" @blur="touched.name = true" />
      <Transition name="err"><p v-if="show('name')" class="err" role="alert">{{ show('name') }}</p></Transition>
    </div>
    <div class="form-row">
      <label :for="`e-${propertyId}`">Email</label>
      <input :id="`e-${propertyId}`" v-model="form.email" type="email" class="input" autocomplete="email" :aria-invalid="!!show('email')" @blur="touched.email = true" />
      <Transition name="err"><p v-if="show('email')" class="err" role="alert">{{ show('email') }}</p></Transition>
    </div>
    <div class="two">
      <div class="form-row">
        <label :for="`p-${propertyId}`">Mobile number</label>
        <input :id="`p-${propertyId}`" v-model="form.phone" type="tel" inputmode="tel" placeholder="09171234567" class="input" autocomplete="tel" :aria-invalid="!!show('phone')" @blur="touched.phone = true" />
        <Transition name="err"><p v-if="show('phone')" class="err" role="alert">{{ show('phone') }}</p></Transition>
      </div>
      <div class="form-row">
        <label :for="`d-${propertyId}`">Preferred date</label>
        <input :id="`d-${propertyId}`" v-model="form.date" type="date" :min="today" class="input" :aria-invalid="!!show('date')" @blur="touched.date = true" />
        <Transition name="err"><p v-if="show('date')" class="err" role="alert">{{ show('date') }}</p></Transition>
      </div>
    </div>
    <div class="form-row">
      <label :for="`m-${propertyId}`">Message <span style="font-weight:400;color:var(--muted)">(optional)</span></label>
      <textarea :id="`m-${propertyId}`" v-model="form.message" class="input" rows="3" :aria-invalid="!!show('message')" @blur="touched.message = true" />
      <Transition name="err"><p v-if="show('message')" class="err" role="alert">{{ show('message') }}</p></Transition>
    </div>
    <button class="btn btn-orange btn-lg" style="width:100%" :disabled="sending">
      <span v-if="sending" class="spinner" /><template v-else>Send request <Icon name="arrow" /></template>
    </button>
    <p class="fine" style="border:0;padding-top:10px">Saved in this browser only. No agent is contacted in this version.</p>
  </form>
</template>
