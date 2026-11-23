<script setup lang="ts">
// "Needs attention" row: every open item with a count, one tap to the place that handles it.
interface AttentionItem { label: string; count: number; to: string; icon: string; urgent?: boolean }
const props = defineProps<{ items: AttentionItem[] }>()
const open = computed(() => props.items.filter(i => i.count > 0))
</script>

<template>
  <section class="x-attn" aria-label="Needs attention">
    <div class="x-attn-head">
      <p class="ws-card-eyebrow" style="margin:0">Needs attention</p>
      <span class="x-muted">{{ open.length ? `${open.reduce((n, i) => n + i.count, 0)} open items` : 'You are all caught up' }}</span>
    </div>
    <div class="x-attn-list">
      <NuxtLink v-for="i in items" :key="i.label" :to="i.to" class="x-attn-item" :class="{ zero: !i.count, urgent: i.urgent && i.count }">
        <span class="x-attn-ico"><Icon :name="i.icon" /></span>
        <b>{{ i.count }}</b>
        <span>{{ i.label }}</span>
      </NuxtLink>
    </div>
  </section>
</template>
