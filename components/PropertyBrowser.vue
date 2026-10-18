<script setup lang="ts">
const props = defineProps<{ preset: { mode?: 'sale' | 'rent'; type?: string; developmentOnly?: boolean }; hideToggle?: boolean }>()
const store = usePropertyStore()
const ui = useUiStore()
const route = useRoute()

store.applyPreset(props.preset)
const q = route.query.q
if (typeof q === 'string') store.filters.query = q
await useAsyncData('properties', async () => { await store.load(); return true })

// Auto-recover from cold-start SSR failure without user needing to refresh
onMounted(async () => {
  if (!store.loaded && !store.loading) {
    await new Promise(r => setTimeout(r, 300))
    await store.retry()
  }
})

watch(() => store.filters, () => { store.page = 1 }, { deep: true })
watch(() => store.sort, () => { store.page = 1 })
watch(() => ui.filterDrawer, v => { if (import.meta.client) document.body.style.overflow = v ? 'hidden' : '' })
onBeforeUnmount(() => { if (import.meta.client) document.body.style.overflow = '' })

const from = computed(() => (store.filtered.length ? (store.page - 1) * store.pageSize + 1 : 0))
const to = computed(() => Math.min(store.page * store.pageSize, store.filtered.length))
function goTo(n: number) {
  store.page = Math.min(Math.max(1, n), store.pageCount)
  document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function applyScroll() { document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
</script>

<template>
  <div>
    <SearchPanel :hide-toggle="props.hideToggle" @apply="applyScroll" />
    <div class="wrap">
      <div id="results" class="results-head" style="scroll-margin-top:90px">
        <div>
          <div class="results-title">
            <h2 aria-live="polite">{{ store.filtered.length }} {{ store.filtered.length === 1 ? 'Property' : 'Properties' }} Found</h2>
            <span>/ Butuan City, Caraga</span>
          </div>
          <div v-if="store.chips.length" class="chips">
            <TransitionGroup name="chip">
              <button v-for="c in store.chips" :key="c.key" class="chip" :aria-label="`Remove ${c.label} filter`" @click="store.removeChip(c.key)">{{ c.label }}<Icon name="close" /></button>
            </TransitionGroup>
            <button class="clear-all" @click="store.resetFilters()">Clear all</button>
          </div>
        </div>
        <div class="toolbar">
          <label class="sort">Sort by:
            <select v-model="store.sort" aria-label="Sort properties">
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="area-desc">Largest floor area</option>
              <option value="newest">Newest listings</option>
            </select>
          </label>
          <div class="view-toggle" role="group" aria-label="View mode">
            <button :aria-pressed="store.view === 'grid'" aria-label="Grid view" @click="store.view = 'grid'"><Icon name="grid" /></button>
            <button :aria-pressed="store.view === 'list'" aria-label="List view" @click="store.view = 'list'"><Icon name="list" /></button>
          </div>
        </div>
      </div>

      <Transition name="fade"><div v-if="ui.filterDrawer" class="drawer-mask" style="z-index:110" @click="ui.filterDrawer = false" /></Transition>

      <div class="layout">
        <FilterSidebar />
        <section aria-label="Property results">
          <div v-if="store.error" class="empty" role="alert">
            <Icon name="alert" /><h3>Something went wrong</h3><p style="color:var(--muted)">{{ store.error }}</p>
            <button class="btn btn-navy" @click="store.retry()">Try again</button>
          </div>
          <div v-else-if="store.loading && !store.loaded" class="grid"><div v-for="n in 6" :key="n" class="skeleton" /></div>
          <div v-else-if="!store.filtered.length" class="empty">
            <Icon name="empty" /><h3>No properties match your filters</h3>
            <p style="color:var(--muted);max-width:360px">Try widening the price range or removing a filter chip to see more homes in Butuan City.</p>
            <button class="btn btn-orange" @click="store.resetFilters()">Clear all filters</button>
          </div>
          <template v-else>
            <TransitionGroup name="grid" tag="div" class="grid" :class="{ list: store.view === 'list' }" style="position:relative">
              <PropertyCard v-for="p in store.paged" :key="p.id" :item="p" />
            </TransitionGroup>
            <div class="pager">
              <span>Showing <b>{{ from }} - {{ to }}</b> of <b>{{ store.filtered.length }}</b> properties (Page {{ store.page }} of {{ store.pageCount }})</span>
              <div v-if="store.pageCount > 1" class="pages">
                <button :disabled="store.page === 1" aria-label="Previous page" @click="goTo(store.page - 1)">‹</button>
                <button v-for="n in store.pageCount" :key="n" :aria-current="n === store.page ? 'page' : undefined" @click="goTo(n)">{{ n }}</button>
                <button :disabled="store.page === store.pageCount" aria-label="Next page" @click="goTo(store.page + 1)">›</button>
              </div>
            </div>
          </template>
          <CtaBanner />
        </section>
      </div>
    </div>
  </div>
</template>
