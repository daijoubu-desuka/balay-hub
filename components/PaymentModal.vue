<script setup lang="ts">
const props = defineProps<{ admin?: boolean; agents?: string[]; me: string }>()
const emit = defineEmits<{ close: [] }>()
const pay = usePaymentStore()
const ui = useUiStore()

const today = new Date().toISOString().slice(0, 10)
const form = reactive({ type: 'Sale' as 'Sale' | 'Rent', clientName: '', propertyTitle: '', location: LOCATIONS[0], amount: '', monthlyRent: '', leaseMonths: '12', date: today, agent: props.agents?.[0] ?? props.me })
const touched = ref(false)
const box = ref<HTMLElement | null>(null)
const total = computed(() => form.type === 'Sale' ? Number(form.amount) || 0 : (Number(form.monthlyRent) || 0) * (Number(form.leaseMonths) || 0))

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (form.clientName.trim().length < 2) e.clientName = 'Enter the client name.'
  if (form.propertyTitle.trim().length < 2) e.propertyTitle = 'Enter the property.'
  if (form.type === 'Sale') { if (!(Number(form.amount) > 0)) e.amount = 'Enter the sale price.' }
  else {
    if (!(Number(form.monthlyRent) > 0)) e.monthlyRent = 'Enter the monthly rent.'
    const m = Number(form.leaseMonths)
    if (!Number.isInteger(m) || m < 1 || m > 120) e.leaseMonths = 'Use 1 to 120 whole months.'
  }
  if (!form.date) e.date = 'Choose the deal date.'
  else if (form.date > today) e.date = 'The date cannot be in the future.'
  return e
})

function submit() {
  touched.value = true
  if (Object.keys(errors.value).length) { ui.toast('Please fix the highlighted fields.', 'error'); return }
  const rent = form.type === 'Rent'
  pay.add({
    date: form.date, type: form.type, clientName: form.clientName.trim(), propertyTitle: form.propertyTitle.trim(), location: form.location,
    agent: props.admin ? form.agent : props.me, amount: total.value, by: props.admin ? 'Admin' : props.me,
    ...(rent ? { monthlyRent: Number(form.monthlyRent), leaseMonths: Number(form.leaseMonths) } : {})
  })
  ui.toast('Saved as Pending in this browser.', 'success')
  emit('close')
}

// focus management: move focus in, keep Tab inside, give it back on close
let prev: HTMLElement | null = null
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') return emit('close')
  if (e.key !== 'Tab' || !box.value) return
  const f = [...box.value.querySelectorAll<HTMLElement>('button,input,select,[href]')].filter(x => !(x as HTMLInputElement).disabled)
  const first = f[0], last = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}
onMounted(() => { prev = document.activeElement as HTMLElement; box.value?.querySelector<HTMLElement>('input')?.focus(); document.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { document.removeEventListener('keydown', onKey); prev?.focus() })
const err = (k: string) => (touched.value ? errors.value[k] : '')
</script>

<template>
  <Teleport to="body">
    <div class="x-mask" @click.self="emit('close')">
      <div ref="box" class="x-modal" role="dialog" aria-modal="true" aria-labelledby="pm-title">
        <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:14px">
          <div><p class="ws-card-eyebrow">{{ admin ? 'Record payment' : 'Record deal' }}</p><h2 id="pm-title" style="font-size:20px">New {{ form.type === 'Sale' ? 'sale' : 'rental' }}</h2></div>
          <button class="icon-btn" aria-label="Close" @click="emit('close')"><Icon name="close" /></button>
        </div>
        <form novalidate @submit.prevent="submit">
          <div class="seg" role="group" aria-label="Deal type" style="margin-bottom:14px">
            <button type="button" :aria-pressed="form.type === 'Sale'" @click="form.type = 'Sale'">Sale</button>
            <button type="button" :aria-pressed="form.type === 'Rent'" @click="form.type = 'Rent'">Rent</button>
          </div>
          <div class="ws-form-grid">
            <div class="form-row"><label for="pm-client">Client name</label>
              <input id="pm-client" v-model="form.clientName" class="input" :aria-invalid="!!err('clientName')" />
              <p v-if="err('clientName')" class="err" role="alert">{{ err('clientName') }}</p></div>
            <div class="form-row"><label for="pm-prop">Property</label>
              <input id="pm-prop" v-model="form.propertyTitle" class="input" placeholder="e.g. House and Lot" :aria-invalid="!!err('propertyTitle')" />
              <p v-if="err('propertyTitle')" class="err" role="alert">{{ err('propertyTitle') }}</p></div>
            <div class="form-row"><label for="pm-loc">Location</label>
              <select id="pm-loc" v-model="form.location" class="input"><option v-for="l in LOCATIONS" :key="l">{{ l }}</option></select></div>
            <div class="form-row"><label for="pm-date">Date</label>
              <input id="pm-date" v-model="form.date" type="date" :max="today" class="input" :aria-invalid="!!err('date')" />
              <p v-if="err('date')" class="err" role="alert">{{ err('date') }}</p></div>
            <template v-if="form.type === 'Sale'">
              <div class="form-row"><label for="pm-amt">Sale price (PHP)</label>
                <input id="pm-amt" v-model="form.amount" type="number" min="0" class="input" :aria-invalid="!!err('amount')" />
                <p v-if="err('amount')" class="err" role="alert">{{ err('amount') }}</p></div>
            </template>
            <template v-else>
              <div class="form-row"><label for="pm-rent">Monthly rent (PHP)</label>
                <input id="pm-rent" v-model="form.monthlyRent" type="number" min="0" class="input" :aria-invalid="!!err('monthlyRent')" />
                <p v-if="err('monthlyRent')" class="err" role="alert">{{ err('monthlyRent') }}</p></div>
              <div class="form-row"><label for="pm-lease">Lease months</label>
                <input id="pm-lease" v-model="form.leaseMonths" type="number" min="1" max="120" class="input" :aria-invalid="!!err('leaseMonths')" />
                <p v-if="err('leaseMonths')" class="err" role="alert">{{ err('leaseMonths') }}</p></div>
            </template>
            <div v-if="admin" class="form-row"><label for="pm-agent">Agent</label>
              <select id="pm-agent" v-model="form.agent" class="input"><option v-for="a in agents" :key="a">{{ a }}</option></select></div>
          </div>
          <div class="x-preview" aria-live="polite">
            <span>Total {{ pesoC(total) }}</span><b>Commission {{ pesoC(commissionOf(total)) }}</b>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
            <button type="button" class="btn btn-ghost" @click="emit('close')">Cancel</button>
            <button type="submit" class="btn btn-orange">Save as Pending →</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
