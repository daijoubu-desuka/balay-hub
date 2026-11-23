<script setup lang="ts">
import type { BuyerForm } from '~/composables/useValidators'

// Buyer identity proof (sign-up step 2 and the resubmit form in My account). Demo: files are never uploaded.
const props = defineProps<{ form: BuyerForm; show: boolean; prefix: string }>()
const errors = computed(() => buyerErrors(props.form))
const e = (k: string) => (props.show ? errors.value[k] : '')
async function pick(ev: Event) {
  const f = (ev.target as HTMLInputElement).files?.[0] ?? null
  props.form.idPhoto = f
  props.form.idPhotoUrl = await toThumb(f)
}
</script>

<template>
  <div class="x-grid2">
    <div class="form-row"><label :for="prefix + 'phone'">Mobile number</label>
      <input :id="prefix + 'phone'" v-model="form.phone" class="input" inputmode="tel" placeholder="09171234567" autocomplete="tel" :aria-invalid="!!e('phone')" />
      <p v-if="e('phone')" class="err" role="alert">{{ e('phone') }}</p></div>
    <div class="form-row"><label :for="prefix + 'idt'">ID type</label>
      <select :id="prefix + 'idt'" v-model="form.idType" class="input"><option v-for="t in ID_TYPES" :key="t">{{ t }}</option></select></div>
    <div class="form-row x-span"><label :for="prefix + 'idn'">ID number</label>
      <input :id="prefix + 'idn'" v-model="form.idNumber" class="input" :aria-invalid="!!e('idNumber')" />
      <p v-if="e('idNumber')" class="err" role="alert">{{ e('idNumber') }}</p></div>
    <div class="form-row x-span"><label :for="prefix + 'idp'">Photo of your ID (front)</label>
      <input :id="prefix + 'idp'" type="file" accept=".jpg,.jpeg,.png,.pdf" class="input x-file" :aria-invalid="!!e('idPhoto')" @change="pick" />
      <p v-if="e('idPhoto')" class="err" role="alert">{{ e('idPhoto') }}</p>
      <img v-if="form.idPhotoUrl" :src="form.idPhotoUrl" alt="Preview of your ID" class="x-prev" /></div>
    <p class="x-muted x-span" style="font-size:12px">JPG, PNG or PDF up to 2 MB. Demo only: no real documents are uploaded or stored, only the file names stay in this browser. Browsing homes never needs an account.</p>
  </div>
</template>
