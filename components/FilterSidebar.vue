<script setup lang="ts">
const store = usePropertyStore()
const ui = useUiStore()
const f = computed(() => store.filters)
const b = computed(() => store.bounds)

const pct = (v: number) => ((v - b.value.min) / (b.value.max - b.value.min)) * 100
const minModel = computed({
  get: () => f.value.minPrice,
  set: (v: number) => { f.value.minPrice = Math.min(Number(v), f.value.maxPrice - b.value.step) }
})
const maxModel = computed({
  get: () => f.value.maxPrice,
  set: (v: number) => { f.value.maxPrice = Math.max(Number(v), f.value.minPrice + b.value.step) }
})
const rangeLabels = computed(() => f.value.mode === 'sale' ? ['₱1M', '₱50M', '₱100M+'] : ['₱5k', '₱100k', '₱200k+'])
const sqmLabel = computed(() => f.value.minSqm === null && f.value.maxSqm === null ? 'Any floor area' : `${f.value.minSqm ?? 0} - ${f.value.maxSqm ?? 'any'} sqm`)
const numOrNull = (e: Event) => { const v = (e.target as HTMLInputElement).value; return v === '' ? null : Math.max(0, Number(v)) }
const stages = ['rfo', 'pre-selling', 'resale']
function toggleStage(s: string) {
  f.value.stages = f.value.stages.includes(s) ? f.value.stages.filter(x => x !== s) : [...f.value.stages, s]
}
</script>

<template>
  <aside class="sidebar" :class="{ open: ui.filterDrawer }" aria-label="Refine search">
    <div class="sb-head">
      <h3><Icon name="filter" /> Refine Search</h3>
      <div style="display:flex;align-items:center;gap:8px">
        <button class="link-orange" @click="store.resetFilters()">Reset</button>
        <button class="icon-btn sb-close" aria-label="Close filters" @click="ui.filterDrawer = false"><Icon name="close" /></button>
      </div>
    </div>

    <div class="sb-group">
      <h4>{{ f.mode === 'sale' ? 'Price Budget (PHP)' : 'Monthly Rent (PHP)' }}</h4>
      <div class="minmax">
        <div><small>Min price</small><b>{{ pesoShort(f.minPrice) }}</b></div>
        <div><small>Max price</small><b>{{ f.maxPrice >= b.max ? 'No max' : pesoShort(f.maxPrice) }}</b></div>
      </div>
      <div class="range">
        <div class="track" />
        <div class="fill" :style="{ left: pct(f.minPrice) + '%', right: (100 - pct(f.maxPrice)) + '%' }" />
        <input v-model.number="minModel" type="range" :min="b.min" :max="b.max" :step="b.step" aria-label="Minimum price" />
        <input v-model.number="maxModel" type="range" :min="b.min" :max="b.max" :step="b.step" aria-label="Maximum price" />
      </div>
      <div class="range-labels"><span>{{ rangeLabels[0] }}</span><span>{{ rangeLabels[1] }}</span><span>{{ rangeLabels[2] }}</span></div>
    </div>

    <div class="sb-group">
      <h4>Property Type</h4>
      <label class="radio"><span>All Types</span><input v-model="f.type" type="radio" name="ptype" value="all" /><i class="dot" /></label>
      <label v-for="(v, k) in typeLabel" :key="k" class="radio"><span>{{ v }}</span><input v-model="f.type" type="radio" name="ptype" :value="k" /><i class="dot" /></label>
    </div>

    <div class="sb-group">
      <h4>Bathrooms</h4>
      <div class="pills" role="group" aria-label="Minimum bathrooms">
        <button v-for="n in [0, 1, 2, 3]" :key="n" class="pill" :aria-pressed="f.baths === n" @click="f.baths = n">{{ n === 0 ? 'Any' : n + '+' }}</button>
      </div>
    </div>

    <div class="sb-group">
      <h4>Floor Area (sqm) <em>{{ sqmLabel }}</em></h4>
      <div class="num-row">
        <input class="num" type="number" min="0" placeholder="Min" aria-label="Minimum floor area" :value="f.minSqm ?? ''" @input="f.minSqm = numOrNull($event)" />
        <span>-</span>
        <input class="num" type="number" min="0" placeholder="Max" aria-label="Maximum floor area" :value="f.maxSqm ?? ''" @input="f.maxSqm = numOrNull($event)" />
      </div>
    </div>

    <div class="sb-group">
      <h4>Turnover Stage</h4>
      <label v-for="s in stages" :key="s" class="check">
        <input type="checkbox" :checked="f.stages.includes(s)" @change="toggleStage(s)" />
        <i class="box"><Icon name="check" /></i><span>{{ stageLabel[s] }}</span>
      </label>
    </div>

    <div class="sb-group">
      <h4>Max Monthly HOA Dues</h4>
      <select v-model.number="f.hoaMax" class="select-plain" aria-label="Maximum monthly HOA dues">
        <option :value="0">Any amount</option>
        <option v-for="n in [60, 90, 120, 150]" :key="n" :value="n">Up to ₱{{ n }} / sqm</option>
      </select>
    </div>

    <div class="note-box">
      <Icon name="shield" />
      <div><b>Butuan City listings</b>Listing details only. Titles, contacts, and agent credentials are not verified.</div>
    </div>
    <button class="btn btn-navy btn-lg sb-close" style="width:100%;margin-top:16px" @click="ui.filterDrawer = false">Show {{ store.filtered.length }} {{ store.filtered.length === 1 ? 'property' : 'properties' }}</button>
  </aside>
</template>
