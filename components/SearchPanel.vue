<script setup lang="ts">
import { BOUNDS, LOCATIONS } from '~/stores/properties'

const store = usePropertyStore()
const f = computed(() => store.filters)
const emit = defineEmits<{ apply: [] }>()
const props = defineProps<{ hideToggle?: boolean }>()

const presets = computed(() => f.value.mode === 'sale'
  ? [
      { id: 'any', label: 'Any price', min: BOUNDS.sale.min, max: BOUNDS.sale.max },
      { id: 'u5', label: 'Under ₱5M', min: BOUNDS.sale.min, max: 5_000_000 },
      { id: '5-10', label: '₱5M – ₱10M', min: 5_000_000, max: 10_000_000 },
      { id: '10-20', label: '₱10M – ₱20M', min: 10_000_000, max: 20_000_000 },
      { id: '20+', label: '₱20M and up', min: 20_000_000, max: BOUNDS.sale.max }
    ]
  : [
      { id: 'any', label: 'Any price', min: BOUNDS.rent.min, max: BOUNDS.rent.max },
      { id: 'u15', label: 'Under ₱15k', min: BOUNDS.rent.min, max: 15_000 },
      { id: '15-30', label: '₱15k – ₱30k', min: 15_000, max: 30_000 },
      { id: '30-60', label: '₱30k – ₱60k', min: 30_000, max: 60_000 },
      { id: '60+', label: '₱60k and up', min: 60_000, max: BOUNDS.rent.max }
    ])

const priceValue = computed({
  get: () => presets.value.find(p => p.min === f.value.minPrice && p.max === f.value.maxPrice)?.id || 'custom',
  set: (id: string) => {
    const p = presets.value.find(x => x.id === id)
    if (p) { f.value.minPrice = p.min; f.value.maxPrice = p.max }
  }
})
const priceLabel = computed(() => presets.value.find(p => p.id === priceValue.value)?.label || `${pesoShort(f.value.minPrice)} – ${pesoShort(f.value.maxPrice)}`)
const bedOptions = [['studio', 'Studio'], ['1', '1 BR'], ['2', '2 BR'], ['3', '3 BR'], ['4', '4 BR+']]
function setBeds(v: string) { f.value.beds = f.value.beds === v ? 'any' : v }
</script>

<template>
  <section class="search-wrap" aria-label="Property search">
    <div class="wrap">
      <form class="search-card" @submit.prevent="emit('apply')" role="search">
        <div class="search-row">
          <div v-if="!props.hideToggle" class="seg" role="group" aria-label="Listing type">
            <button type="button" :aria-pressed="f.mode === 'sale'" @click="store.setMode('sale')">For Sale</button>
            <button type="button" :aria-pressed="f.mode === 'rent'" @click="store.setMode('rent')">For Rent</button>
          </div>
          <label class="field-box">
            <Icon name="search" /><span class="sr-only">Search properties in Butuan City</span>
            <input v-model="f.query" type="search" placeholder="Search Butuan City properties" autocomplete="off" />
          </label>
          <div class="sel">
            <label for="s-loc"><Icon name="pin" />Location</label>
            <select id="s-loc" v-model="f.location">
              <option value="all">Butuan City, Agusan del Norte</option>
              <option v-for="l in LOCATIONS" :key="l" :value="l">{{ l }}</option>
            </select>
            <Icon class="chev" name="chevron" />
          </div>
          <div class="sel">
            <label for="s-type"><Icon name="building" />Property type</label>
            <select id="s-type" v-model="f.type">
              <option value="all">All Types</option>
              <option v-for="(v, k) in typeLabel" :key="k" :value="k">{{ v }}</option>
            </select>
            <Icon class="chev" name="chevron" />
          </div>
          <div class="sel">
            <label for="s-price"><Icon name="cash" />Price range</label>
            <select id="s-price" v-model="priceValue">
              <option v-for="p in presets" :key="p.id" :value="p.id">{{ p.label }}</option>
              <option v-if="priceValue === 'custom'" value="custom">{{ priceLabel }}</option>
            </select>
            <Icon class="chev" name="chevron" />
          </div>
          <button type="submit" class="btn btn-orange btn-apply" style="height:auto;min-height:46px">Apply <Icon name="arrow" /></button>
        </div>
        <div class="bed-row">
          <div class="pills" role="group" aria-label="Bedrooms">
            <span class="lbl">Bedrooms:</span>
            <button v-for="[v, l] in bedOptions" :key="v" type="button" class="pill" :aria-pressed="f.beds === v" @click="setBeds(v)">{{ l }}</button>
          </div>
          <div class="pills">
            <button type="button" class="tool-link filter-open" @click="useUiStore().filterDrawer = true"><Icon name="sliders" /> More Filters <span class="count-pill">{{ store.chips.length }}</span></button>
            <button type="button" class="tool-link" @click="store.resetFilters()"><Icon name="reset" /> Reset</button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>
