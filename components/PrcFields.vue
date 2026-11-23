<script setup lang="ts">
import { PRC_DOCS, type PrcForm } from '~/composables/useValidators'

// Shared PRC fields for agent sign-up and the agent Verification tab. Demo: the file is never uploaded.
const props = defineProps<{ form: PrcForm; show: boolean; prefix: string; part?: 'info' | 'docs' }>()
const errors = computed(() => prcErrors(props.form))
const preview = ref('')
async function pick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  props.form.file = f
  toThumb(f).then(u => (props.form.fileUrl = u))
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = f && f.type.startsWith('image/') ? URL.createObjectURL(f) : ''
}
onBeforeUnmount(() => preview.value && URL.revokeObjectURL(preview.value))
async function pickDoc(k: typeof PRC_DOCS[number]['key'], ev: Event) {
  const f = (ev.target as HTMLInputElement).files?.[0] ?? null
  props.form.docs[k] = f
  if (k === 'photo') props.form.photoUrl = await toThumb(f)
}
const e = (k: string) => (props.show ? errors.value[k] : '')
defineExpose({ errors })
</script>

<template>
  <div class="x-grid2">
    <template v-if="part !== 'docs'">
    <div class="form-row"><label :for="prefix + 'no'">PRC license number</label>
      <input :id="prefix + 'no'" v-model="form.no" class="input" inputmode="numeric" maxlength="7" placeholder="0019442" :aria-invalid="!!e('no')" />
      <p v-if="e('no')" class="err" role="alert">{{ e('no') }}</p></div>
    <div class="form-row"><label :for="prefix + 'type'">License type</label>
      <select :id="prefix + 'type'" v-model="form.type" class="input"><option>Real Estate Broker</option><option>Salesperson</option></select></div>
    <div class="form-row"><label :for="prefix + 'exp'">Expiry date</label>
      <input :id="prefix + 'exp'" v-model="form.expiry" type="date" class="input" :aria-invalid="!!e('expiry')" />
      <p v-if="e('expiry')" class="err" role="alert">{{ e('expiry') }}</p></div>
    <div class="form-row"><label :for="prefix + 'file'">Photo of the license (JPG, PNG or PDF, up to 2 MB)</label>
      <input :id="prefix + 'file'" type="file" accept=".jpg,.jpeg,.png,.pdf" class="input" style="padding-top:10px;height:auto;min-height:46px" :aria-invalid="!!e('file')" @change="pick" />
      <p v-if="e('file')" class="err" role="alert">{{ e('file') }}</p>
      <img v-if="preview" :src="preview" alt="Preview of the selected license file" class="x-prev" /></div>
    <p class="ws-card-eyebrow x-span" style="margin:6px 0 0">About your practice</p>
    <div class="form-row"><label :for="prefix + 'yrs'">Years of real estate experience</label>
      <input :id="prefix + 'yrs'" v-model="form.years" class="input" inputmode="numeric" maxlength="2" placeholder="3" :aria-invalid="!!e('years')" />
      <p v-if="e('years')" class="err" role="alert">{{ e('years') }}</p></div>
    <div class="form-row"><label :for="prefix + 'areas'">Areas you serve</label>
      <input :id="prefix + 'areas'" v-model="form.areas" class="input" placeholder="Ampayon, Libertad, Doongan" :aria-invalid="!!e('areas')" />
      <p v-if="e('areas')" class="err" role="alert">{{ e('areas') }}</p></div>
    <div v-if="form.type === 'Salesperson'" class="form-row"><label :for="prefix + 'brk'">Supervising broker (required for salespersons)</label>
      <input :id="prefix + 'brk'" v-model="form.broker" class="input" placeholder="Broker's full name" :aria-invalid="!!e('broker')" />
      <p v-if="e('broker')" class="err" role="alert">{{ e('broker') }}</p></div>
    <div class="form-row"><label :for="prefix + 'tin'">TIN</label>
      <input :id="prefix + 'tin'" v-model="form.tin" class="input" inputmode="numeric" placeholder="123-456-789" :aria-invalid="!!e('tin')" />
      <p v-if="e('tin')" class="err" role="alert">{{ e('tin') }}</p></div>
    </template>
    <template v-if="part !== 'info'">
    <p class="ws-card-eyebrow x-span" style="margin:0">Supporting documents</p>
    <div v-for="d in PRC_DOCS" :key="d.key" class="form-row">
      <label :for="prefix + d.key">{{ d.label }} <span class="x-muted">{{ d.req ? '(required)' : '(optional)' }} · {{ d.hint }}</span></label>
      <input :id="prefix + d.key" type="file" accept=".jpg,.jpeg,.png,.pdf" class="input" style="padding-top:10px;height:auto;min-height:46px" :aria-invalid="!!e(d.key)" @change="pickDoc(d.key, $event)" />
      <p v-if="e(d.key)" class="err" role="alert">{{ e(d.key) }}</p></div>
    <div class="form-row x-span">
      <label class="check" style="font-weight:500"><input v-model="form.consent" type="checkbox" /><i class="box"><Icon name="check" /></i><span>I confirm this is my own license and agree to its review.</span></label>
      <p v-if="e('consent')" class="err" role="alert">{{ e('consent') }}</p></div>
    </template>
    <p v-if="part !== 'info'" class="x-muted x-span" style="font-size:12px">Demo only: no real documents are uploaded or stored. Only the file name is kept in this browser.</p>
  </div>
</template>
